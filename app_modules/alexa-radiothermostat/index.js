'use strict';
var request = require('request');
var alexa = require('alexa-app');

var thermostatApp = new alexa.app('thermostat');

thermostatApp.intent('setTemp', function(req, res) {
	var setToTemp = req.slot('setTemperature');
	var setToMode = req.slot('setMode');
	request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {t_heat: parseFloat(setToTemp)}});
	res.card("Thermostat Skill","Thermostat is set to " + parseInt(setToTemp) + " degrees");
	res.say("Thermostat is set to " + parseInt(setToTemp) + " degrees");
});

// process get temperature request
// This intent uses the res.send() feature for a delayed response back to alexa due to async http request.
thermostatApp.intent('getTemp', function(req, res) {
  request(process.env.THERMOSTAT_URL + '/tstat', function (error, response, body) {
    console.log('Error: ' + error, 'RESPONSE: ' + response, 'BODY: ' + body);
    body = JSON.parse(body);
    switch(body.tmode){
		case 0: // OFF
			res.say("Thermostat current temperature is " + body.temp + " degrees, the thermostat is currently turned off.");
			res.card("Thermostat Skill","Thermostat current temperature is " + body.temp + " degrees, the thermostat is currently turned off.");
			break;
		case 1: // HEAT
			res.say("Thermostat current temperature is " + body.temp + " degrees, the thermostat is set to heat and the target temperature is " + body.t_heat + " degrees.");
			res.card("Thermostat Skill","Thermostat current temperature is " + body.temp + " degrees, the thermostat is set to heat and the target temperature is " + body.t_heat + " degrees.");
			break;
		case 2: // COOL
			res.say("Thermostat current temperature is " + body.temp + " degrees, the thermostat is set to cool and the target temperature is " + body.t_cool + " degrees.");
			res.card("Thermostat Skill","Thermostat current temperature is " + body.temp + " degrees, the thermostat is set to cool and the target temperature is " + body.t_cool + " degrees.");
			break;
		case 3: // AUTO
			res.say("Thermostat current temperature is " + body.temp + " degrees, the thermostat is currently turned auto.");
			res.card("Thermostat Skill","Thermostat current temperature is " + body.temp + " degrees, the thermostat is currently turned auto.");
			break;
		default:
			res.say("Something went wrong please try again.");
			res.card("Something went wrong please try again.");
			break;
	}
    res.send();
  });
  return false;
});

// process launch request when no utterances detected
thermostatApp.launch(function(req, res) {
  console.log('REQUEST', JSON.stringify(req));
  res.say("You can say, what is the temperature, or set the temperature to 75!");
});

module.exports = function(cb) {
  global.thermostat = thermostatApp;
  cb();
};
