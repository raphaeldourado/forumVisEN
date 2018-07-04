//GLOBAL VARS
let forum_infos, user_names;

//read aux data
d3.csv("data/forum_infos.csv", function(data){
    DATASTORE.forum_infos = data;

    fillForumCombobox();
});

d3.csv("data/user_names.csv", function(data){
    DATASTORE.student_names = data;
});
