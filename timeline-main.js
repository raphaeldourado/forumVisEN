
    const element = document.getElementById('timeline-div');
    
    let nestedData, filteredData, timelineData;

    //TODO separar carregamento dos dados do plotting
    function drawTimeline(options){
        //lima grafico antigo
        d3.selectAll("#timeline-div > *").remove();

        d3.csv("data/data_disc-148_letras-2P-20151-Garanhuns.csv", function(raw_data){
            //group by userid
            nestedData = d3.nest()
                .key(function(d) { return d.userid; })
                .entries(raw_data);
            
            //seleciona apenas alunos escolhidos
            filteredData = nestedData.filter(d=>{return options.selectedStudents.includes(d.key);});
    
            //ordena eventos
            sortEvents(filteredData);
    
            //remove eventos com mesmo timestamp
            removeCollisions(filteredData);
    
            //formata dados
            timelineData = filteredData.map(user_log => ({
                label: translateStudentId(user_log.key).substring(0, 24)+"...", //trunca para evitar overflow
                data: format_userlogs(user_log.values)
            }));
    
            //filtra pelo periodo desejado
            //TODO o array original estah sendo diretamente modificado. Mudar isso na funcao filterTimelineDataByPeriod
            if (options.forum_id != -1){// -1 == Todos
                filterTimelineDataByForum(timelineData, options.forum_id);     
            }
            
            //verifica se existem dados para serem plotados
            let continuePlotting = false;
            timelineData.forEach((element) => {
                if(element.data.length > 0){
                    continuePlotting = true;
                    element.remove = false;
                } else {
                    element.remove = true;
                }
            });
            //remove linhas sem dados
            timelineData = timelineData.filter(d=>{return d.remove == false});
    
            if (continuePlotting){
                //TODO chamar via botao
                removeTimeSpacesAndAlign(timelineData);
                
                //const timeline = new TimelineChart(element, filtered_timelineData, {
                const timeline = new TimelineChart(element, timelineData, {
                    enableLiveTimer: false,
                    height: 50 * timelineData.length
                }).onVizChange(bringEventsToFront(EVENT_TYPES.FORUM_COLABORACAO)); //deixa sempre os eventos de colaboracao no front
        
                createGradientsDefs();
                setEventsColor();
                addTooltip();
        
                //esconde linha do tempo
                d3.select(".x.axis").style("visibility", "hidden");
            }
        });
    }
    

    //cria as combinacoes de gradientes que poderam ser usados
    function createGradientsDefs(){

        let defs = d3.select("defs");
        //para cada tipo de evento, cria um gradiente com final em EVENT_TYPES.FORUM_COLABORACAO
        //padrao de nome <EVENT_TYPE>_precolab_grad
        color_map.forEach(event_color => {
            const grad_name = event_color.event.concat("_precolab_grad");

            let gradient = defs.append("linearGradient")
            .attr("id", grad_name);
            gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", "0%")
            .attr("stop-color", event_color.color)
            .attr("stop-opacity", 1);
            gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "100%")
            .attr("stop-color", getEventColor(EVENT_TYPES.FORUM_COLABORACAO))
            .attr("stop-opacity", 1);
        });
    }

    //colore os eventos de acordo com a classe
    function setEventsColor() {
        d3.selectAll(".interval").style('fill', function (d) {
            if (d.isPreColab){
                return `url(#${d.customClass.concat('_precolab_grad')})`;
            } else {
                return getEventColor(d.customClass);
            }            
        });
        
        d3.selectAll(".dot").style('fill', function (d) {
            return getEventColor(d.customClass);
        });
    }

    function addTooltip(){
        d3.selectAll(".interval,.dot")
        .on("mousemove", function () { return d3.select("#tl-tooltip").style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
        .on('mouseover', function (d) {
            d3.select("#tl-tooltip").style("visibility", "visible");
            d3.select("#tooltip-event-name").text(d.customClass);

            if (d.type == TimelineChart.TYPE.POINT){
                d3.select("#tooltip-timeStart").text(moment(d.at_bkp).format('DD/MM/YYYY HH:mm:ss'));
                d3.select("#tooltip-timeEnd").text("--");
            } else {
                d3.select("#tooltip-timeStart").text(moment(d.from_bkp).format('DD/MM/YYYY HH:mm:ss'));
                d3.select("#tooltip-timeEnd").text(moment(d.to_bkp).format('DD/MM/YYYY HH:mm:ss'));
                //d3.select("#tooltip-timeStart").text(moment(d.from).format('DD/MM/YYYY HH:mm:ss') + " || " + moment(d.from_bkp).format('DD/MM/YYYY HH:mm:ss'));
                //d3.select("#tooltip-timeEnd").text(moment(d.to).format('DD/MM/YYYY HH:mm:ss') + " || " + moment(d.to_bkp).format('DD/MM/YYYY HH:mm:ss'));
            }

            d3.select("#tooltip-target").text(d.target);
            d3.select("#tooltip-objecttable").text(d.objecttable);
        })
        .on('mouseout', function (d) {
            d3.select("#tl-tooltip").style("visibility", "hidden");
        });
    }

    //usa filter ao inves de splice
    //TODO modificar para retornar uma copia, e nao modificar o valor original
    function filterTimelineDataByForum(timelineData, forum_id){
        
        //let filtered = Object.assign([], timelineData);
        //let filtered = JSON.parse(JSON.stringify(timelineData))
        //let filtered = $.extend(true,{},timelineData);
        
        //let start = new Date('Feb 15, 2015'), end = new Date('March 19, 2015');

        //identifica periodo de atividade do usuario para o forum informado, e filtra
        timelineData.forEach((student) => {
            let firstOcurrence = student.data.find(element => {
                return element.objectId == forum_id;
            });
            
            start = (firstOcurrence !== undefined) ? firstOcurrence.real_timestamp : undefined;

            let end = undefined;
            for (let i = student.data.length -1 ; i >= 0; i--) { //percorre descrecentemente
                const element = student.data[i];

                if (element.objectId == forum_id){
                    end = element.real_timestamp;
                    break;
                }
                
            }

            //marca eventos no periodo
            student.data.forEach((event) => {
                if (start === undefined || end === undefined || (event.real_timestamp.getTime() < start.getTime() || event.real_timestamp.getTime() > end.getTime())){
                    event.out_of_range = true;
                } else {
                    event.out_of_range = false;
                }
            });   

            //remove os marcados
            student.data = student.data.filter(d=>{return d.out_of_range == false});
        });

        //return filtered;
    }   
    

    function format_userlogs(user_logs){
        let arr_formatted_logs = new Array();

        user_logs.forEach(function(log,index){
            let f_log = new Object();
            f_log.label = ''; //eventual uso futuro
            f_log.target = log.target;
            f_log.objecttable = log.objecttable;
            f_log.objectId = log.objectid;

            //backup do timestamp. 'to' e 'from' serao manipulados no alinhamento
            f_log.real_timestamp = parseBrDate(log.t);            
            
            //identifica a classe e se o evento eh pre-colab
            let classification = classify_log(log, index, user_logs);
            f_log.customClass = classification.class;
            f_log.isPreColab = classification.isPreColab;
            
            if (f_log.customClass == EVENT_TYPES.FORUM_COLABORACAO){
                f_log.type = TimelineChart.TYPE.POINT;
            } else {
                f_log.type = TimelineChart.TYPE.INTERVAL;
            }

            if (f_log.type == TimelineChart.TYPE.POINT){
                f_log.at = f_log.at_bkp = parseBrDate(log.t);
            } else { //TimelineChart.TYPE.INTERVAL
                f_log.from = f_log.from_bkp = calculateIntervalStart(log, f_log.customClass, index, user_logs);
                f_log.to = f_log.to_bkp = calculateIntervalEnd(f_log, index, user_logs);
                correctLongIntervals(f_log);
            }            


            //add to array
            arr_formatted_logs.push(f_log);
        });

        return arr_formatted_logs;
    }

//classifica o evento de log em categorias
//retorna obj com a classe identificada e uma flag indicando se eh um evento pre-colaboracao
function classify_log(log, index, all_logs){

    let identified_class = '', pre_colab = false;

    if (['loggedin', 'loggedinas'].includes(log.action)) identified_class = EVENT_TYPES.LOGIN
        else if (['loggedout'].includes(log.action)) identified_class = EVENT_TYPES.LOGOUT
        //mensagens enviadas e recebidas (lidas)
        else if (log.component == 'core' && ['viewed', 'sent'].includes(log.action) && log.target == 'message') identified_class = EVENT_TYPES.MENSAGEM
        //recursos visualizados
        //  mod_folder > viewed
        //  mod_glossary > deleted/created/updated > entry
        //  mod_glossary > viewed > course_module
        //  mod_resource > Viewed > course_module
        //  mod_url > viewed > course_module
        //  report_log > viewed > report/user_report
        //  core > viewed > course, course_resources_list
        else if ((log.component == 'mod_folder' && ['viewed'].includes(log.action)) ||
            (log.component == 'mod_glossary' && ['deleted','created','updated'].includes(log.action) && log.target == 'entry') ||
            (log.component == 'mod_glossary' && ['viewed'].includes(log.action) && log.target == 'course_module') ||
            (log.component == 'mod_resource' && ['viewed'].includes(log.action) && log.target == 'course_module') ||
            (log.component == 'mod_url' && ['viewed'].includes(log.action) && log.target == 'course_module') ||
            (log.component == 'report_log' && ['viewed'].includes(log.action) && ['report','user_report'].includes(log.target)) ||
            (log.component == 'core' && ['viewed'].includes(log.action) && ['course', 'course_resources_list'].includes(log.target))
            ) identified_class = EVENT_TYPES.RECURSO_VISUALIZADO
        //forum - visualizou
        else if ((log.component == 'mod_forum' && ['viewed'].includes(log.action)) || 
            (log.component == 'mod_forum' && ['searched'].includes(log.action) && log.target == 'course')
            ) identified_class = EVENT_TYPES.FORUM_VISUALIZACAO
        //forum - acompanhou
        else if ((log.component == 'mod_forum' && ['created','deleted'].includes(log.action) && log.target == 'subscription') ||
            (log.component == 'mod_forum' && ['disabled','enabled'].includes(log.action) && log.target == 'readtracking')
            ) identified_class = EVENT_TYPES.FORUM_ACOMPANHAMENTO
        //forum - colaborou
        else if (log.component == 'mod_forum' && 
            ['deleted','created','updated'].includes(log.action) && 
            ['post', 'discussion'].includes(log.target)
            ) identified_class = EVENT_TYPES.FORUM_COLABORACAO
        //demais eventos
        else identified_class = EVENT_TYPES.OUTROS;  
        
    //verifica se este evento precede um evento de colaboracao
    let next_log = all_logs[index + 1];
    if (next_log!== undefined && next_log.component == 'mod_forum' && 
        ['deleted','created','updated'].includes(next_log.action) && 
        ['post', 'discussion'].includes(next_log.target)){
        
        pre_colab = true;
    }

    return {class: identified_class, isPreColab: pre_colab};
}
