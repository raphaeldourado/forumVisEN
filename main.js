//GLOBAL VARS
let forum_infos, user_names;

d3.select("header").html("Loading...");

//carrega dados para timeline
d3.csv("data/data_disc-148_letras-2P-20151-Garanhuns.csv", function(data){
    DATASTORE.raw_logs = data;
    d3.select("header").html("ForumVis"); //este eh o mais demorado
});

//read aux data
d3.csv("data/forum_infos.csv", function(data){
    DATASTORE.forum_infos = data;

    fillForumCombobox();
});

d3.csv("data/user_names.csv", function(data){
    DATASTORE.student_names = data;
});
