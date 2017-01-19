'use strict';
var request = require('request');
var alexa = require('alexa-app');

var thermostatApp = new alexa.app('thermostat');

thermostatApp.intent('setState', function(req, res) {
	request(process.env.THERMOSTAT_URL + '/tstat', function (error, response, body) {
		console.log('Error: ' + error, 'RESPONSE: ' + response, 'BODY: ' + body);
		body = JSON.parse(body);
		var setTheState = req.slot('setTheMode');
		var txtSetStateResponse = "The thermostat's current temperature is " + body.temp + " degrees, ";
		switch(setTheState){
			case "off": // OFF
				request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {tmode: 0}});
				txtSetStateResponse = txtSetStateResponse + "the thermostat is now turned off.";
				break;
			case "heat": case "hot": case "warm": // HEAT
				request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {tmode: 1}});
				txtSetStateResponse = txtSetStateResponse + "the thermostat is now turned on to heat.";
				break;
			case "AC": case "cold": case "cool": case "air conditioner": // COOL
				request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {tmode: 2}});
				txtSetStateResponse = txtSetStateResponse + "the thermostat is now turned on to air conditioner.";
				break;
			case "auto": case "automatic": // AUTO
				request.post(process.env.THERMOSTAT_URL + '/tstat', {json: {tmode: 3}});
				txtSetStateResponse = txtSetStateResponse + "the thermostat is now turned on to auto.";
				break;
			default:
				txtSetResponse = "Something went wrong please try again.";
				break;
		}
	res.say(txtSetStateResponse);
	res.card("Thermostat Skill",txtSetStateResponse);
	res.send();
	});
  return false;
});

thermostatApp.intent('setTemp', function(req, res) {
  request(process.env.THERMOSTAT_URL + '/tstat', function (error, response, body) {
    console.log('Error: ' + error, 'RESPONSE: ' + response, 'BODY: ' + body);
    body = JSON.parse(body);
	var setToTemp = req.slot('setTemperature');
	var setToMode = req.slot('setMode');
	var txtSetResponse = "The thermostat's current temperature is " + body.temp + " degrees, ";

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
			break;
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
