/**
 * Permet a partie du numero de version de la trame
 * de choisir la version du decoder a utiliser pour la partie data
 * 
 * -NOTE: le header NE BOUGE PAS dans le temps
 */
const CODES = require("./consts");
const half_float = require('./utils/half.float');

//les decoders et leurs versions....
const decode_datas = require("./version1/decode.datas");


const debug = require("debug")("debug");

// Pour l'instant, ne gere qu'une version du protocol
/**
 * Decode les données du payload et retourne des données
 * mises en forme "js style"
 * @param {*} payload le buffer de données
 * @param {*} offset l'offset dans le buffer -en theorie 7 (taille du header)
 * @param {*} datas l'objet contenant les informations du header de la trame  (version_protocol, 
 *      niveau de baterie....)
 */
function read_datas(payload, offset, datas){
    
    let version = datas.header.version_protocol;
    let type = datas.header.type;
    let nbrVoies = datas.header.nbrVoies;


    let dt = null;

    //console.log("Read datas: ", type)
    
    //il faudra rendre ca un peu plus simple a modifier...
    switch (version){
        case 1:
        default:{
            switch(type){
                    case CODES.TYPE_SYNCHRONISATION:{
                        //VERSION PROTOCOL 1: pas de données 
                        let version = '0.0';
                        let build = '0000';
                        //MODIF: recupere le timestamp: soit 8 octets
                         if(payload.length >= offset + 6) {
                            //let pck_date = new Date(payload.readInt32BE());
                            version = parseFloat(payload.readFloatBE(offset)).toFixed(2);
                            build = payload.readInt16BE(offset+4);
                           
                        } 
                        dt = {
                            measures: {
                                date: datas.header.date,
                                version: version+" B"+build,
                                
                            },
                            complete_datas:true,
                            offset: offset};
                            debug(dt)
                        break;
                    }
                    case CODES.TYPE_NEW_DATAS:
                    case CODES.TYPE_ECHEC_DATAS:{
                        //des données de measures, recupere les...                        
                        dt = decode_datas(payload, offset, nbrVoies); 
                        //debug("datas: ", dt)                       
                        break;
                    }
                    case CODES.TYPE_INFOS_CAMPAGNE:{
                        //normalement, 1 octet a lire, 0= fin, 1= start
                        dt = {
                            measures: {
                                action: payload.readInt8(offset++)                             
                            },
                            complete_datas:true,
                            offset: offset};
                            break;
                    }
                    default:{
                        //type inconnu, silently fail
                        debug("Unknown type: ", type)
                        break;
                    }
                
            }
           
        }
    }
    
    return dt;
    
}


module.exports = read_datas;