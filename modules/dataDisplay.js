﻿//dataDisplay.js
//This Module will manage displaying speedData to lcd and led displays directly connected to the beaglebone
//

var util = require('util');
var extend = require('extend');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('dataDisplay');
var nconf = require('nconf');
var AdafruitLedBackpack = require('./AdafruitLedBackpack.js');;

var dataDisplay = function (options) {
    var self = this;
    
    var defaultOptions = {
        //loaded from Config
    }


    nconf.file('./configs/dataDisplayConfig.json');
    var configFileSettings = nconf.get();
    var objOptions = extend({}, defaultOptions, configFileSettings);

    var commonData = { ledDisplays: [], lcdDisplays: [] };

    

    // EventEmitters inherit a single event listener, see it in action
    this.on('newListener', function (listener) {
        debug('dataDisplay Event Listener: ' + listener);
    });

    this.updateSpeedData = function (speedData) {
        try{
            debug('updateSpeedData ', speedData);
            if (objOptions.displayLocation) {
                if (objOptions.displayLocation.inMaxSpeed && objOptions.displayLocation.inMaxSpeed.enabled == true) {
                    debug('inMaxSpeed enabled ', objOptions.displayLocation.inMaxSpeed);
                    switch (objOptions.displayLocation.inMaxSpeed.type) {
                        case "ledDisplays":
                            var ledDisplays = commonData[objOptions.displayLocation.inMaxSpeed.type];
                            if (ledDisplays && ledDisplays[objOptions.displayLocation.inMaxSpeed.index]) {
                                debug('inMaxSpeed ledDisplays ');
                                var myLed =  ledDisplays[objOptions.displayLocation.inMaxSpeed.index];
                                if (myLed.ledDisplay.enabled == true) {
                                    var myAdafruitLedbackPack = myLed.led;
                                    myAdafruitLedbackPack.writeNumber(speedData.inMaxSpeed, false, function (err, speedData) {
                                        debug('inMaxSpeed ledDisplay ' + objOptions.displayLocation.inMaxSpeed.index + ' writeNumber ' + speedData.inMaxSpeed, err);
                                    }, speedData);
                            } else {
                                    debug("ledDisplay not yet ready");
                            }
                            }
                            break;
                    }

                }

                if (objOptions.displayLocation.outMaxSpeed && objOptions.displayLocation.outMaxSpeed.enabled == true) {
                    debug('outMaxSpeed enabled ', objOptions.displayLocation.outMaxSpeed);
                    switch (objOptions.displayLocation.outMaxSpeed.type) {
                        case "ledDisplays":
                            var ledDisplays = commonData[objOptions.displayLocation.outMaxSpeed.type];
                            if (ledDisplays && ledDisplays[objOptions.displayLocation.outMaxSpeed.index]) {
                                debug('outMaxSpeed ledDisplays ');
                                var myLed =  ledDisplays[objOptions.displayLocation.outMaxSpeed.index];
                                if (myLed.ledDisplay.enabled == true) {
                                    var myAdafruitLedbackPack = myLed.led;
                                    myAdafruitLedbackPack.writeNumber(speedData.outMaxSpeed, false, function (err, speedData) {
                                        debug('outMaxSpeed ledDisplay ' + objOptions.displayLocation.outMaxSpeed.index + ' writeNumber ' + speedData.outMaxSpeed, err);
                                    }, speedData);
                                } else {
                                    debug("ledDisplay not yet ready ");
                                }
                            }
                            break;
                    }

                }


                if (objOptions.displayLocation.inOutMaxSpeed && objOptions.displayLocation.inOutMaxSpeed.enabled == true) {
                    debug('inOutMaxSpeed enabled ', objOptions.displayLocation.inOutMaxSpeed);
                    switch (objOptions.displayLocation.inOutMaxSpeed.type) {
                        case "ledDisplays":
                            var ledDisplays = commonData[objOptions.displayLocation.inOutMaxSpeed.type];
                            if (ledDisplays && ledDisplays[objOptions.displayLocation.inOutMaxSpeed.index]) {
                                debug('inMaxSpeed ledDisplays ');
                                var myLed = ledDisplays[objOptions.displayLocation.inOutMaxSpeed.index];
                                if (myLed.ledDisplay.enabled == true) {
                                    var myAdafruitLedbackPack = myLed.led;
                                    var myInMax = Math.round(speedData.inMaxSpeed).toString();
                                    if (myInMax.length == 1) {
                                        myInMax = "0" + myInMax;
                                    }
                                    if (myInMax.length == 0) {
                                        myInMax = "00";
                                    }
                                    var myOutMax = Math.round(speedData.outMaxSpeed).toString();
                                    if (myOutMax.length == 1) {
                                        myOutMax = "0" + myOutMax;
                                    }
                                    if (myOutMax.length == 0) {
                                        myOutMax = "00";
                                    }
                                    var myInOutMax = myInMax + myOutMax;
                                    myAdafruitLedbackPack.writeNumber(myInOutMax, true, function (err, myInOutMax) {
                                        debug('inMaxSpeed ledDisplay ' + objOptions.displayLocation.inOutMaxSpeed.index + ' writeNumber ' + myInOutMax, err);
                                    }, myInOutMax);
                                } else {
                                    debug("ledDisplay not yet ready");
                                }
                            }
                            break;
                    }

                }
            }
        } catch (ex) {
            debug("Error updateSpeedData", ex)
        }
        
    }

    

    
    if (objOptions.ledDisplays) {

        for (var i = 0; i < objOptions.ledDisplays.length; i++) {
            var ledDisplay = extend({},objOptions.ledDisplays[i]);
            var ledData = { ledDisplay: ledDisplay, index: i };
            commonData.ledDisplays.push(ledData);
            ledData.led = new AdafruitLedBackpack();
            debug('attempting adafruitLedBackpack init', ledDisplay);
            if (ledDisplay.enabled == true) {
                ledDisplay.enabled = false; //set to false tell we are done initing
                ledData.led.Initialize({ I2CAddress: ledDisplay.I2CAddress, I2CDevice: ledDisplay.I2CDevice }, function (err, ledData) {
                    debug('i2c adafruitLedBackpack Inited ' + ledData.index, err );
                        
                    ledData.led.writeNumber(ledData.index, false, function (err, ledData) {
                        ledData.ledDisplay.enabled = true;
                        debug('i2c adafruitLedBackpack ledDisplay ' + ledData.index + ' writeNumber ', err);
                    }, ledData);
                       
                }, ledData);
            }
                
        }
    }

    

}
util.inherits(dataDisplay, EventEmitter);

module.exports = dataDisplay;