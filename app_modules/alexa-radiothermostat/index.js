'use strict';
var request = require('request');
var alexa = require('alexa-app');

var thermostatApp = new alexa.app('thermostat');

thermostatApp.intent('setTemp', function(req, res) {
  request(process.env.THERMOSTAT_URL + '/tstat', function (error, response, body) {
    console.log('Error: ' + error, 'RESPONSE: ' + response, 'BODY: ' + body);
    body = JSON.parse(body);
	var setToTemp = req.slot('setTemperature');
	var setToMode = req.slot('setMode');
	var txtSetResponse = "The thermostat's current temperature is " + body.temp + " degrees, ";
	switch(setToMode){
		case "heat": case "hot": case "warm": // HEAT
			request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {t_heat: parseFloat(setToTemp)}});
			txtSetResponse = txtSetResponse + "the thermostat is set to heat mode and the temperture is set to " + parseInt(setToTemp) + " degrees.";
			break;
		case "AC": case "cold": case "cool": case "air conditioner": // COOL
			request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {t_cool: parseFloat(setToTemp)}});
			txtSetResponse = txtSetResponse + "the thermostat is set to air conditioner mode and the temperture is set to " + parseInt(setToTemp) + " degrees.";
			break;
		case undefined: // The mode wasn't specified so I get the current mode and update just the temp and leave the mode the same
			switch(body.tmode){
				case 0: // OFF
					txtSetResponse = txtSetResponse + "the thermostat is currently turned off, please turn it on to change the temperture.";
					break;
				case 1: // HEAT
					request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {t_heat: parseFloat(setToTemp)}});
					txtSetResponse = txtSetResponse + "the thermostat is set to heat mode and the temperture is set to " + parseInt(setToTemp) + " degrees.";
					break;
				case 2: // COOL
					request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {t_cool: parseFloat(setToTemp)}});
					txtSetResponse = txtSetResponse + "the thermostat is set to air conditioner mode and the temperture is set to " + parseInt(setToTemp) + " degrees.";
					break;
				case 3: // AUTO
					txtSetResponse = txtSetResponse + "this command can not be completed because the thermostat is currently set to auto mode.";
					break;
				default:
					txtSetResponse = "Something went wrong please try again.";
			}
			break;
		default:
			txtSetResponse = "Something went wrong please try again.";
	}	
	res.say(txtSetResponse);
	res.card("Thermostat Skill",txtSetResponse);
	res.send();
  });
  return false;
});

// process get temperature request
// This intent uses the res.send() feature for a delayed response back to alexa due to async http request.
thermostatApp.intent('getTemp', function(req, res) {
  request(process.env.THERMOSTAT_URL + '/tstat', function (error, response, body) {
    console.log('Error: ' + error, 'RESPONSE: ' + response, 'BODY: ' + body);
    body = JSON.parse(body);
	var txtGetResponse = "The thermostat's current temperature is " + body.temp + " degrees, ";
    switch(body.tmode){
		case 0: // OFF
			txtGetResponse = txtGetResponse + "the thermostat is currently turned off.";
			break;
		case 1: // HEAT
			txtGetResponse = txtGetResponse + "the thermostat is set to heat mode and the target temperature is " + body.t_heat + " degrees.";
			break;
		case 2: // COOL
			txtGetResponse = txtGetResponse + "the thermostat is set to cool mode and the target temperature is " + body.t_cool + " degrees.";
			break;
		case 3: // AUTO
			txtGetResponse = txtGetResponse + "the thermostat is currently set to auto mode.";
			break;
		default:
			txtGetResponse = "Something went wrong please try again.";
	}
    res.say(txtGetResponse);
	res.card("Thermostat Skill",txtGetResponse);
	res.send();
  });
  return false;
});

// process launch request when no utterances detected
thermostatApp.launch(function(req, res) {
  console.log('REQUEST', JSON.stringify(req));
  res.say("You can say, what is the temperature, or set heat to 72, or set the temperature to 75!");
});

module.exports = function(cb) {
  global.thermostat = thermostatApp;
  cb();
};
