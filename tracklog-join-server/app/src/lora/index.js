const CODES = require("./consts");
const read_datas = require("./decoders");
const {__read_from_byte,__write_to_byte} = require('./utils.js');

const HEADER_SIZE = 7;

function __decode(trame_b64, start_offset = 0, type = 2) {
    let payload = trame_b64;

    //minimum attendu, 7bytes
    if (payload[start_offset] == 0x02) return {
        datas: null,
        offset: start_offset + 1
    }; //sync

    if (payload.length < start_offset + HEADER_SIZE) {
        console.log("Error: not enought for Header");
        return {
            datas: null,
            offset: start_offset + payload.length
        };//invalid, not enought datas for header
    }

    //console.log("start decoding....")
    let datas = {};
    try {
        let header = {
            type: type,  ////  MODIF! le type PEUT etre defini par le num de port!! --------------------------------------------------------------------- !!!!!!!! MODIF
            nbrVoies: CODES.UNSET,
            battery: CODES.UNSET,
            version_protocol: CODES.UNSET,
            config_version: CODES.UNSET,
            date: CODES.UNSET
        };

        let offset = start_offset;

        header.type = payload.readUInt8(offset++);
        let v_b = payload.readUInt8(offset++);
        header.battery = __read_from_byte(v_b, 4, 0, true);
        header.nbrVoies = __read_from_byte(v_b, 4, 4, true);
        if (header.nbrVoies < 0 || header.nbrVoies > 5) {
            console.log("Nbr de voies Error: ", header.nbrVoies);
            return {
                datas: null,
                offset: offset
            };
        }

        v_b = payload.readUInt8(offset++);

        //4 first = nbr de voies, 4 last = config version
        header.config_version = __read_from_byte(v_b, 4, 0, true);
        header.version_protocol = __read_from_byte(v_b, 4, 4, true);

        header.date = payload.readUInt32BE(offset);
        //@MODIF TEMP (surement): time origin: 01/01/2017 00:00:00Z
        // a ajouter a la date donnée pour avoir l'UTC
        //header.date += DATE_ORIGIN;
        offset += 4;

        datas.header = header;

        //console.log("Paquet header: ", header);
        //parse les données du payload (if any)
        //en theorie, si un payload, doit etre des mesures...
        //console.log("Header from payload ", datas.header)
        //datas.channels = read_datas(payload, offset, datas);
        let res = read_datas(payload, offset, datas);

        if (res == null) {
            //erreur???

            return {
                datas: null,
                offset: offset
            };
        }
        //console.log(res)
        datas.channels = res.measures;
        datas.measures_count = res.measures_count;
        datas.alarms = res.alarms;//les alarmes trouvées...
        datas.complete_datas = res.complete_datas;
        //le nbr de mesures, ca peut etre interressant                 ---------------------------- !!!! TODO
        offset = res.offset;

        return {
            datas: datas,
            offset: offset
        };
    }
    catch (err) {
        console.log("Oups ", err); //besoin de le lire pour l'instant, mais voir a logger les erreurs?
        return null;
    }
}

function make_config_trame(configuration, version = 1) {
}

module.exports = {
    LoRa_decodR: __decode,
    make_config_trame: make_config_trame
}