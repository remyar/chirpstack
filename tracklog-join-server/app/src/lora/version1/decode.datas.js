// decode la partie du payload specifique aux données
/*
 Decodage des trames de données LoRa
 alarmstate: 8octets (fix) etat pour chaque voie de chaque mesure de l'alarms (bit set)
        m0: v0 v1 v2 v3 ... 8bits
        m1: ....
        5 octets

Petite note: les datas doivent etre envoyées dans le microservice de store et notification sous la forme de tableau de données PAR CHANNELS.
Le decoder de données va donc renvoyer un tableau contenant les données ORGANISéES PAR VOIES (et pas par mesure) ET l'offset dans le buffer
*/

const half_float = require("../utils/half.float");


/**
 * BIG BUG: comme je ne connait pas les voies configurées encore, je ne peux pas
 * determiner les voies en alertes et a quoi correspond les bits d'alertes!!!!
 */
module.exports = function(payload, offset, voies){
    let total = payload.length;//taille complete du payload

    
    
    let alarms = [];
    let complete = true; // par defaut, le paquet est valide!!!

    if (offset+1 > total) throw 'Invalid Payload: alarms states: not enought data (got '+total+' need '+(offset + 1);
    //les voies: 5 obligatoire!
    for(let i=0;i<5;i++) alarms.push(payload.readInt8(offset++));
    
    let measures = [];
    //ordonne par mesures
    for(let i=0;i<voies;i++) measures.push([]);

    
    //tant qu'il reste des mesures....

    //NOTE: si des données en alertes, doit arreter la lecture ---------------------------------------------------------------------------> A VOIR!!!
    let mc = 0;
    // Test: si pas de données, return null?
    
    if(offset == total){
        throw 'Empty Payload: No measures!';
    }
    while (offset < total && mc < 5){ //5 datas max
        //let ms = [];
        //verifie si assez pour une voie, soit 2*nbrvoies octets
        if(offset + 2*voies > total) {
            complete = false;
            break;//throw 'Invalid Payload: measures: not enought data -got '+total+' need '+(offset + 2*voies);
        }
        //get datas
        
        for(let i=0;i<voies;i++){
            
            let v = payload.readInt16BE(offset);
            //converti en float16
            //console.log(mc, alarms[mc], i);
            // probleme: numero de voie?
            let m = {
                value: half_float.decodeFloat16(v),    
                //@TODO simple hack le temps d'avoir les configs, mais devra, a partir de la configuration
                //determiner les voies en alarmes                 
                alarmState: false// ((alarms[mc]>>i) & 1) == 1

            }
            
            offset+=2;
            //ms.push(m);
            measures[i].push(m);
            
        }
        mc++;
        //enregistre la nouvelle mesure
        //measures.push(ms);
    }
        
    //console.log(mc, measures)
    return {measures: measures, offset: offset, alarms:alarms, measures_count : mc, complete_datas: complete};
}
