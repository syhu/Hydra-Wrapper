var fs = require("fs");
var demosite = JSON.parse(fs.readFileSync("../../../../connector/onvif/test/demosite.json", "utf8"));

test = function (input) {
	var self = this;
	var onDone = function (response) {
		console.log("onDone");
		if (typeof(response) !== "undefined")
			console.log(response);
	}
	var onError = function (response) {
		console.log("onError");
		console.log(response);
	}
	var onNotify = function (response) {
		console.log("onNotify");
		console.log(response);
	}

	var getDevInfo = {
		"onDone": onDone,
		"onError": onError
	};

	var setup = {
		"onDone": onDone,
		"onError": onError,
		"onNotify": onNotify,
		"device_type": "onvif",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd
	};

	setup.onDone = function (response) {
		self.wrapper.getDeviceInformation(getDevInfo);
	}

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
