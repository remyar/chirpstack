const mqtt = require("mqtt");
const codec = require('./lora');
const TRAME_TOPICS = require('./lora/consts');

const MINIMAL_DEVICE_DATE = 1483225200; // date minimale acceptable par un device: 1er janvier 2017

class LoraMqttClient {
    constructor(mqttUrl, mqttOptions) {
        this._mqttClient = mqtt.connect(mqttUrl);
        this._mqttClient.on('connect', this._onConnect.bind(this));
        this._mqttClient.on('message', this._onMessage.bind(this));

    }

    _onConnect() {
        this._mqttClient.subscribe("application/+/device/+/event/+");
        console.log("Connected to broker");
        console.log("Waiting messages");
    }

    _onMessage(topic, message) {
        if (topic.startsWith('application/')) {
            this.processLoraMessage(topic, message);
        }
    }

    processLoraMessage(topic, message) {
        let topic_items = topic.split('/');
        let msg_datas = message;

        try { msg_datas = JSON.parse(message); } catch (err) {
            // not json datas, bye
            return;
        }

        //console.log(topic);
        //console.log(msg_datas);

        return this.__processLoraMessage(topic_items, msg_datas);
    }

    __processLoraMessage(topic_items, message) {

        let dt = message;

        if (topic_items[0] == 'application') {
            //Parse le contenu du topic pour recuperer les informations 
            let app_id = topic_items[1];
            let node_id = topic_items[3];
            let action = topic_items[5];

            //les données LoRa
            let devEUI = dt.deviceInfo?.devEui;
            let fPort = dt.fPort;

            switch (action) {
                case 'up': {
                    console.log('CHECK RX PAQUET');
                    let payload = null;
                    try {
                        let binaryDatas = Buffer.from(dt.data, 'base64');
                        let p = codec.LoRa_decodR(binaryDatas, 0, fPort);
                        if (p == null || p.datas == null) {
                            console.log('Invalid paquet decoding')
                            return null;
                        }
                        payload = p.datas;
                    } catch (err) {
                        console.log('Invalid paquet decoding');
                        console.error(err);
                        return null;
                    }

                    if (!payload) {
                        console.log('Invalid paquet decoding')
                        return null;
                    }

                    if (!payload.complete_datas && !payload.channels.complete_datas) {
                        //Log special pour Gilles
                        console.log({ alert: "Trame LoRa incomplete, derniere mesure non recuperable " });
                        //logger.logServerError(this, LOGS_LORA_TRAME,"Incomplete trame: "+dt.data);
                    }

                    // SUIVANT LE TYPE DE TRAMES -----------------------------------------------------------------
                    let server_task = null;
                    let device_build_version = payload.channels.version || null;// '0.0B0000';
                    let campagne_state = undefined; //par defaut, la campagne est active?
                    let alarmstate = undefined; // etat de l'appareil, a mettre a jour?
                    let techalert = undefined; // alerte technique

                    switch (payload.header.type) {
                        // Synchronisation des appareils avec le serveur -----------------------------------------------------------------------
                        case TRAME_TOPICS.TYPE_SYNCHRONISATION: {
                            console.log({ rx: 1, action: 'Demande de synchronisation' });
                            let p = null;
                            if (process.env.LORA_SYNCHRO_DUMMY == '1') {
                                //la version 'pure utc'

                                p = Promise.resolve({
                                    data: {
                                        result: [
                                            {
                                                createdAt: Date.now(),
                                                rxInfo: {}
                                            }
                                        ]
                                    }

                                });
                            }

                            server_task = p.then(frame => {
                                let utc_time = Date.now();
                                utc_time -= 2000;//enleve 2 seconde (RX1)

                                //si a une frame, recup l'heure si possible....
                                if (frame && frame.data && frame.data.result && frame.data.result.length > 0) {
                                    let frm = frame.data.result[0]; // POUR L'instant, ne sait pas si tx ou rx???

                                    if (frame.data.result.length > 1 && (!frm.rxInfo || frm.rxInfo.length <= 0)) {
                                        //debug("No RX on first frame, switch to second (only ONE TX)");                                       
                                        frm = frame.data.result[1];

                                    }
                                    utc_time = new Date(frm.createdAt).getTime();
                                }

                                //recupere l'heure du payload: ie heure du device
                                let test = MINIMAL_DEVICE_DATE;//par defaut, le 01/01/2017 00:00:00
                                //debug("header date; ",payload.header.date)
                                //valide la date renvoyée, si la date n'est pas 'valide', refuse la modification!!!
                                try { test = new Date((payload.header.date + MINIMAL_DEVICE_DATE) * 1000).getTime(); } catch (err) {
                                    return Promise.reject("Invalid date!!!");
                                }
                                if (test < MINIMAL_DEVICE_DATE) {
                                    return Promise.reject("Invalid date");
                                }

                                console.log({ "device_time": test, "version_build": payload.channels.version })

                                //renvoie la difference
                                return utc_time - test;


                            })
                                .then(diff => {
                                    //publish back hour UTC
                                    //debug(diff,SYNCHRO_THRESHOLD )
                                    //si superieure a un threshold, remet a l'heure...

                                    if (true || Math.abs(diff) > SYNCHRO_THRESHOLD) {
                                        topic_items[topic_items.length - 1] = 'tx';
                                        let t = topic_items.join('/');

                                        let b = Buffer.alloc(5);
                                        b.writeInt8(1); //le type de datas en reponse    
                                        b.writeInt32BE(parseInt(diff / 1000), 1); //en secondes

                                        //ajoute un log avec les infos
                                        console.log("CLOUD SERVER", "Mise a l'heure: " + devEUI + " a " + diff);
                                        this.mqttPublistToLoraDevice(devEUI, b.toString('base64'))
                                            .catch(err => {
                                                //epic_fail('Synchro error: ', err);
                                                console.log({ sync: 'Synchro error: ' + err.toString() });
                                            });

                                    }
                                    else {
                                        wlog.log_infos({ sync: "Synchro non utile (min Diff: 30s)..." });
                                    }
                                })
                                .catch(err => {
                                    console.error({ sync: 'Synchro error: ' + err.toString() });
                                });

                            break;
                        }
                    }



                    break;
                }
            }
        }
    }

    // ------------------------------------------------------  HELPERS -----------------------------------------------------------    
    //helper: permet de mettre en forme un topic simplement pour envoyer sur le lora-wan
    mqttPublistToLoraDevice(devEUI, base64_data, confirmed = false, fPort = 80, reference = null) {
        //publie sur le topic medifroid cloud
        let t = 'application/' + process.env.LORA_APP_ID + '/device/' + devEUI + '/command/down';
        //empaquete les données
        let dt = {
            'devEui' : devEUI,
            'confirmed': false,//confirmed,
            'data': base64_data,//buff.toString('base64'),// new Date().getTime(),
            'fPort': fPort
        };
        return this._mqttClient.publishAsync(t, JSON.stringify(dt));
    }
}

module.exports = LoraMqttClient;