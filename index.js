var Service, Characteristic;
var axios = require("axios");

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  // registration of each accessory
  homebridge.registerAccessory("homebridge-octoprint-plus", "OctoPrintPlus", OctoPrintPlus);
}

//**************************************************************************************************
// General Functions
//**************************************************************************************************



//**************************************************************************************************
// Bricklet Remote Switch
//**************************************************************************************************

function OctoPrintPlus(log, config) {
  this.log = log;

  // parse config
  this.name = config["name"];
  this.server = config["server"] || 'http://octopi.local';
  this.apiKey = config["api_key"];

  log.info("Initialized OctoPrint Plus Accessory at " + this.server);
}

OctoPrintPlus.prototype = {
  getServices: function() {

    var informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Guy Sheffer and the Community")
      .setCharacteristic(Characteristic.Model, "OctoPrint");

    var controlService = new Service.Lightbulb();

    controlService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPrintingState.bind(this))
      .on('set', this.setPrintingState.bind(this));

    controlService
      .getCharacteristic(Characteristic.Brightness)
      .on('get', this.getProgress.bind(this))
      .on('set', this.setProgress.bind(this));

    // set name
    controlService.setCharacteristic(Characteristic.Name, this.name);

    return [informationService, controlService];
  },

  // This function gets the current printing state (1 = printing, 0 = not printing)
  getPrintingState(callback) {
    this.log('Getting current printing state: GET ' + this.server + '/api/printer');

    var options = {
      method: 'GET',
      uri: this.server + '/api/printer',
      headers: {
        "X-Api-Key": this.apiKey
      },
      json: true
    };

    axios.request(options).then(function(printState) {
        var state = printState.state.flags.printing;
        console.log("Printer is printing: " + state)
        if (state == false) {
          callback(null, 0);
        } else {
          callback(null, 1);
        }
      })
      .catch(function(error) {
        callback(error);
      });
  },

  setPrintingState(value, callback) {
    if (value == 1) {
      console.log("Resuming print.");
      var options = {
        method: 'POST',
        uri: this.server + '/api/job',
        headers: {
          "X-Api-Key": this.apiKey
        },
        body: {
          "command": "resume"
        },
        json: true
      };
      axios.request(options).then(function(printState) {
          console.log("Print resumed successfully.")
          callback(null);
        })
        .catch(function(error) {
          callback(error);
        });
    } else {
      console.log("Pausing print.");
      var options = {
        method: 'POST',
        uri: this.server + '/api/job',
        headers: {
          "X-Api-Key": this.apiKey
        },
        body: {
          "command": "pause"
        },
        json: true
      };
      axios.request(options).then(function(printState) {
          console.log("Print paused successfully.")
          callback(null);
        })
        .catch(function(error) {
          callback(error);
        });
    }
  },

  getProgress(callback) {
    this.log('Getting current job data: GET ' + this.server + '/api/job');

    var options = {
      method: 'GET',
      uri: this.server + '/api/job',
      headers: {
        "X-Api-Key": this.apiKey
      },
      json: true
    };

    axios.request(options).then(function(printState) {
        var completion = printState.progress.completion;
        if (completion == null) {
          console.log("Printer currently not printing.")
          callback(null, 0);
        } else {
          console.log("Current completion: " + JSON.stringify(completion));
          completionInt = Math.round(parseFloat(completion));
          callback(null, completionInt);
        }
      })
      .catch(function(error) {
        callback(error);
      });
  },

  setProgress(value, callback) {
    if (value === 100) {
      console.log("Cancelling print.");
      var options = {
        method: 'POST',
        uri: this.server + '/api/job',
        headers: {
          "X-Api-Key": this.apiKey
        },
        body: {
          "command": "cancel"
        },
        json: true
      };
      axios.request(options).then(function(printState) {
          console.log("Print cancelled successfully.")
          callback(null);
        })
        .catch(function(error) {
          callback(error);
        });
    } else {
      console.log("Cannot set custom progress!");
      callback(1);
    }
  }
}
