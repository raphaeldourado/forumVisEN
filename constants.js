//constants
const EVENT_TYPES = {
    LOGIN : 'login', 
    LOGOUT: 'logout',
    MENSAGEM: 'mensagem',
    RECURSO_VISUALIZADO: 'recurso_visualizado', 
    FORUM_VISUALIZACAO: 'forum_visualizacao',
    FORUM_ACOMPANHAMENTO: 'forum_acompanhamento',
    FORUM_COLABORACAO: 'forum_colaboracao', 
    OUTROS: 'outros'
};

//map step names to colors
const sunburst_colors = {
    'login':"black",                    
    'logout': "gray",                    
    //'mensagem': "cyan",                    
    'msg': "cyan",                    
    // 'recurso_visualizado' : "green",                    
    'VisRec' : "green",                    
    // 'forum_visualizacao': "yellow",                    
    'VisForum': "yellow",                    
    'forum_acompanhamento': "orangered",                    
    // 'forum_colaboracao' : "red",                    
    'Post' : "red",                    
    'outros': "purple"
};  

const color_map = [
    {event: EVENT_TYPES.LOGIN, color: 'black'},                    
    {event: EVENT_TYPES.LOGOUT, color: 'gray'},                    
    {event: EVENT_TYPES.MENSAGEM, color: 'cyan'},                    
    {event: EVENT_TYPES.RECURSO_VISUALIZADO, color: 'green'},                    
    {event: EVENT_TYPES.FORUM_VISUALIZACAO, color: 'yellow'},                    
    {event: EVENT_TYPES.FORUM_ACOMPANHAMENTO, color: 'orangered'},                    
    {event: EVENT_TYPES.FORUM_COLABORACAO, color: 'red'},                    
    {event: EVENT_TYPES.OUTROS, color: 'purple'}
    ]; 


const DATASTORE = {
    forum_infos : null,
    student_names: null,
    raw_logs: null
}