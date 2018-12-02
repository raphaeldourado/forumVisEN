function fillForumCombobox() {
    let raw = d3.map(DATASTORE.forum_infos, function (d) { return d.id_forum +"|"+ d.forum_name; }).keys();
    //let foruns = [{value: -1, text: "Todos"}]; //desbilitado temporariamente
    let foruns = [];
    raw.forEach(element => {
        let splitted = element.split("|");
        foruns.push({value: splitted[0], text: splitted[1]});
    });
    
    var target = document.getElementById('cbforum');
    clearCbOptions(target);
    populateCbOptions(target, foruns);
}

function clearCbOptions(cbelement){
    cbelement.options.length = 0;
}

function populateCbOptions(cbelement, options){

    //sorted_options = options.sort();

    options.forEach((op, index) => {
        var newOption = document.createElement("option");
        newOption.value = op.value;
        newOption.text = op.text;

        if (index == 0){ //primeira pos eh selecionada
            newOption.setAttribute('selected', 'selected');
        }
        cbelement.add(newOption);    
    });        
}

function  loadForumStudentList(){
    let mainDiv = document.getElementById("studentsList-div");
    let selectedForumId = document.getElementById("cbforum").value;
    //lima div
    d3.selectAll("#studentsList-div > *").remove();
    
    //filtra estudantes que participaram do forum
    let student_ids = d3.map(DATASTORE.forum_infos.filter(function (row) { return row.id_forum == selectedForumId; }),
                             function (d) { return d.userid; }).keys();

    student_ids.forEach(id => {
        let newDiv = document.createElement("DIV");
        newDiv.setAttribute("class", "studentLabelGroup");

        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.name = checkBox.id = "ckStudent"+id;
        checkBox.setAttribute("class", "studentCk");;
        checkBox.value = id;
        newDiv.appendChild(checkBox);
        
        let label = document.createElement("LABEL");
        label.id = "lbckStudent"+id;
        label.setAttribute("class", "studentCkLabel");
        label.setAttribute("for", checkBox.id);
        label.innerText = translateStudentId(id);
        newDiv.appendChild(label);

        mainDiv.appendChild(newDiv);
    });
}

function translateStudentId(id) {
    let student = DATASTORE.student_names.filter(d => { return d.userid == id; })[0];
    return (student === undefined) ? "Unknown" : student.user_name;
}

function translateForumId(id) {
    let forum = DATASTORE.forum_infos.filter(d => { return d.id_forum == id; })[0];
    return (forum === undefined) ? "Unknown" : forum.forum_name;
}

function translateDiscussionId(id) {
    let discussion = DATASTORE.forum_infos.filter(d => { return d.id_discussion == id; })[0];
    return (discussion === undefined) ? "Unknown" : discussion.forum_name; //mostra nome do forum, ao inves da discussion. Mudar talvez depois
}