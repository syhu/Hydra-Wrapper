var fs = require("fs");
var demosite = JSON.parse(fs.readFileSync("../../../Hydra-Connector-DVR/test/demosite.json", "utf8"));

test = function (input) {
	var self = this;
	var onDone = function (response) {
		console.log("onDone");
		if (typeof(response) !== "undefined")
			console.log(response);
	}
	var onFail = function (response) {
		console.log("onFail");
		console.log(response);
	}
	var onNotify = function (response) {
		console.log("onNotify");
		console.log(response);
	}

	var pmask = {
		"onDone": onDone,
		"onFail": onFail,
		"Masks": [
/*			{"x": 0, "y": 0, "width": 1, "height": 1},
			{"x": 1, "y": 1, "width": 1, "height": 1},
			{"x": 2, "y": 2, "width": 1, "height": 1},
*/
		],
		"ch": 0
	};

	var setup = {
		"onFail": onFail,
		"onNotify": onNotify,
		"device_type": "deeplet",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd
	};

	setup.onDone = function (response) {
		self.wrapper.setPrivacyMasks(pmask);
	};

	var wrapper = require("../../wrapper.js");
	this.wrapper = new wrapper();
	this.wrapper.setup(setup);

/*	while (typeof(this.wrapper.getDeviceInformation) === "undefined") {
		if (typeof(this.wrapper.getDeviceInformation) !== "undefined") {
			console.log("getDeviceInformation");
			this.wrapper.getDeviceInformation(getDevInfo);
		}
	}
//	console.log(this.wrapper.__proto__);
	this.wrapper.getDeviceInformation(getDevInfo);
*/
}
test();
