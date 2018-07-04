const EVENTS_SEPARATION_INTERVAL = 1*1000;
const TRUNC_INTERVAL_AT = 60*30*1000;
const TRUNCED_INTERVAL_LENGTH_SECONDS = 60*5*1000;
//FUNCOES AUXILIARES


//permite trazer um objeto para o front
d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
    this.parentNode.appendChild(this);
    });
};

function bringEventsToFront(eventType){
    d3.selectAll(`.${eventType}`).moveToFront();
}

function calculateIntervalStart(log, customClass, index, all_logs) {
    return parseBrDate(log.t);
}

//OBS: já recebe o f_log.from calculado pela funcao calculateIntervalStart
//setado como EVENTS_SEPARATION_INTERVAL segundos antes do inicio do proximo evento. caso nao haja proximo, seta para 1m depois do inicio do evento
function calculateIntervalEnd(formatted_log, index, all_logs) {
    const next_log = (index < all_logs.length - 1) ? all_logs[index + 1] : undefined;
    formatted_log.trunked = false; //informa se a duracao do evento foi truncado ou nao

    //let default_endTime = (next_log == undefined) ? undefined : moment(parseBrDate(next_log.t)).subtract(EVENTS_SEPARATION_INTERVAL/1000, "s").toDate();
    let default_endTime = (next_log == undefined) ? undefined : parseBrDate(next_log.t);

    if (next_log == undefined){ //caso este seja o ultimo da lista, retorna o log.t + 1m
        formatted_log.trunked = true;
        return moment(formatted_log.from).add(1, 'm').toDate(); 
    } else if (formatted_log.customClass == EVENT_TYPES.LOGOUT){

        if (parseBrDate(next_log.t) - formatted_log.from.getTime() > 60*1000){
            return moment(formatted_log.from).add(1, 'm').toDate();
        } else {
            return default_endTime;
        }
    } else { //comportamento padrao: retorna o t do prox log menos EVENTS_SEPARATION_INTERVAL segundos
        return default_endTime; 
    }
}

//trunca intervalos muito longos (possivel incosistencia nos logs)
function correctLongIntervals(formatted_log){
    if (formatted_log.to.getTime() - formatted_log.from.getTime() > (TRUNC_INTERVAL_AT)){
        //formatted_log.to = moment(formatted_log.from).add(TRUNCED_INTERVAL_LENGTH_SECONDS, "m").toDate(); //TODO talvez sinalizar visualmente de algum modo essa correção nos dados
        //atualiza tb o to_bkp, para ser mostrado corretamente na interface
        formatted_log.to = formatted_log.to_bkp = new Date(formatted_log.from.getTime() + TRUNCED_INTERVAL_LENGTH_SECONDS); //TODO talvez sinalizar visualmente de algum modo essa correção nos dados
        formatted_log.trunked = true;
    }
}

function parseBrDate(date){
    //uses moment.js
    parsed_date = moment(date, 'YYYY-MM-DD HH:mm:ss');
    return parsed_date.toDate();    
}      

//ordena por tempo
function sortEvents(data) {
    data.forEach(key => {
        key.values = key.values.sort((a, b) => { return parseBrDate(a.t).getTime() - parseBrDate(b.t).getTime(); });
    });
}

//exclui eventos com mesmo timestamp. Mantém apenas o ultimo (na ordem que estiver no array)
function removeCollisions(nestedData){

    nestedData.forEach((item) => {
        item.values.forEach((event, index, full_array) => {
            if (full_array[index + 1] !== undefined && event.t == full_array[index + 1].t){
                full_array.splice(index, 1);
            }
        });   
    });
}

//remove lacunas de tempo entre os eventos e alinha
function removeTimeSpacesAndAlign(chart_data){

    //alinha os eventos de acordo com data atual
    let alignStartTime = new Date();

    chart_data.forEach((student) =>{
        let currentTime = alignStartTime;
        student.data.forEach((item, index) =>{
            if (item !== undefined){
                if (item.type == TimelineChart.TYPE.POINT){ //apenas desloca o 'at' do evento
                    item.at = currentTime;
                } else { //altera o 'to' e 'from'
                    let eventIntervalSizeInMs = item.to.getTime() - item.from.getTime();
                
                    item.from = currentTime;
                    item.to = new Date(currentTime.getTime() + eventIntervalSizeInMs);
                }            
    
                //atualiza currentTime, adicionando 0,5s de espaço entre os eventos
                currentTime = (item.type == TimelineChart.TYPE.POINT) ? new Date(item.at.getTime() + 500) : new Date(item.to.getTime() + 500); 
            }
        }); 
    });  
}

function getEventColor(eventType){
    let result = color_map.filter(map_item=>{return map_item.event == eventType})[0];
    if (result === undefined){
        throw "eventType invalido: " + eventType; 
    } else {
        return result.color;
    }
}


function getForumPeriod(data, forum_id){
    //tem q ser por aluno! o filtro deve ser feito nos logs de cd aluno, pois eles podem interagir em periodos diferentes com o forum.
    
    //let 
}

