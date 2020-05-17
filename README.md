# homebridge-octoprint-plus

Plugin to support [OctoPrint](https://octopi.octoprint.org) 3D printer control via the [HomeBridge Platform](https://github.com/nfarina/homebridge). Builds on the original [homebridge-octoprint]() by allowing pausing/resuming of prints, not just cancelling.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-octoprint using: npm install -g homebridge-octoprint
3. Update your configuration file. See sample-config.json in this repository for a sample or below.

```
"accessories": [
    {
      "accessory": "OctoPrintPlus",
      "name": "PrinterName",
      "api_key": "XXXXX"
    }
]
```

# What does this plugin do?

This plugin adds the current print status of OctoPrint to HomeKit. The print status is shown as a lightbulb, with the brightness value equaling the current print progress (0-100%). If you deactivate the lightbulb, OctoPrint is instructed to pause the current print. Activating the lightbulb will resume the print. Setting the lightbulb to 100% will cancel the print where it is.

# Notes for implementation

## Possible Characteristics and Services
Description of characteristics (available methods and how to build listener) can be found [here]( https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/Characteristic.js). Characteristics have a setValue() and a getValue() method.

Overview of all available characteristics and services can be found [here](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js).

When adding characteristics:
* getCharacteristic: Searches for characteristic in service and returns it. If non existent but optional -> create one and return it
* setCharacteristic: getCharacteristic + setValue()

## Start in Developer Mode

To start the plugin in developer mode run `homebridge -D -P . -U ~/.homebridge-dev/` while being in the root directory. A sample config has to be saved at `~/.homebridge-dev/`.
