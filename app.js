
var extend = require('extend');
var nconf = require('nconf');
var debug = require('debug')('app');

var BatteryMonitor = require("./modules/batteryMonitor.js");
var DataDisplay = require("./modules/dataDisplay.js");

try {
    var defaultOptions = {
        //loaded from the config file
    };
    nconf.file('./configs/radarMonitorClientConfig.json');
    var configFileSettings = nconf.get();
    var objOptions = extend({}, defaultOptions, configFileSettings);

    //var batteryMonitor = new BatteryMonitor({});
    var dataDisplay = new DataDisplay({});
   
    var socket = require('socket.io-client')(objOptions.host);
    socket.on('connect', function () {
        console.log('Socket Connected');
    });
    socket.on('radarSpeed', function (data) {
        dataDisplay.updateSpeedData(data);
        console.log('Socket radarSpeed Event', data);
    });
    socket.on('batteryVoltage', function (data) {
        console.log('Socket batteryVoltage Event', data);
    });
    socket.on('radarConfig', function (data) {
        console.log('Socket radarConfig Event', data);
    });
    socket.on('radarCommand', function (data) {
        console.log('Socket radarCommand Event', data);
    });
    socket.on('disconnect', function () {
        console.log('Socket Disconnected');
    });
} catch (e) {
    console.log(e);
}