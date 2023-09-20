require('dotenv').config({ silent: true });

const LoraMqttClient = require('./src/LoraMqttClient');

console.log("Connection to broker...");
console.log(process.env.MQTT_URL);


new LoraMqttClient(process.env.MQTT_URL, {});