    //TODO remover outliers
/*
    console.log(data);
    console.log("before rem: ", data.length);

    //deixar isso parametrizavel via interface
    for (let index = 0; index < data.length; index++) {
        const path = data[index][0];
        if ((path.match(/-/g) || []).length > 9){
            console.log(data.splice(index, 1));
        }        
    }

    console.log("after rem: ", data.length);
*/

//d3.json("data/sunburst_data.json", function (data) {

//var json = buildHierarchy(generate_sunburst_dataset(data));

function generate_sunburst_dataset(data){
    //converte dados para o formato esperado por buildHierarchy

    /////////////////////////////monta array inicial
    let user_paths = []; //array de strings
    let graph_data = [];
    
    data.forEach(user => {
        let path = "";
        let lastEventClass = undefined; //usado para concatenar eventos iguais consecutivos

        for (let index = 0; index < user.data.length; index++) {
            const user_event = user.data[index];

            //desconsidera eventos de login/logout
            //if (user_event.customClass != EVENT_TYPES.LOGIN && user_event.customClass != EVENT_TYPES.LOGOUT){
            if (user_event.customClass != EVENT_TYPES.LOGOUT
                && user_event.customClass != EVENT_TYPES.LOGIN
                && user_event.customClass != EVENT_TYPES.FORUM_ACOMPANHAMENTO
                && user_event.customClass != EVENT_TYPES.OUTROS
            ){
                if (user_event.customClass != EVENT_TYPES.FORUM_COLABORACAO){
                    if (user_event.customClass != lastEventClass){
                        path = (path == "") ? user_event.customClass : path.concat("-"+user_event.customClass);
                    }
                    
                    lastEventClass = user_event.customClass;
                } else {
                    path = (path == "") ? user_event.customClass : path.concat("-"+user_event.customClass);
                    lastEventClass = undefined;
                    break;
                }
            }    
        }

        user_paths.push(path);
    });


    /////////////////////////////aglomera caminhos comuns
    //remove caminhos vazios e que não terminam em "forum-colaboracao"
    user_paths = user_paths.filter(d=>{return d !== "" && d.endsWith(EVENT_TYPES.FORUM_COLABORACAO)});
    //conta ocorrencias
    user_paths.sort();
    let lastElement = undefined;
    let count = 0;
    user_paths.forEach((element, index) => {

        if (index == 0){
            count += 1;
        } else if (element == lastElement){
            count += 1;
        } else {
            graph_data.push([lastElement,count]);
            count = 1;
        }

        lastElement = element;
    });

    console.log("DATASET FINAL: ", graph_data);
    return graph_data;
}