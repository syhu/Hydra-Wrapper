var fs = require("fs");
var demosite = JSON.parse(fs.readFileSync("../../../../connector/onvif/test/demosite118.json", "utf8"));

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

	var setLowRes = {
		"onDone": onDone,
		"onFail": onFail,
		"channel": 1,
	};

	var setup = {
		"onDone": onDone,
		"onFail": onFail,
		"onNotify": onNotify,
		"device_type": "onvif",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd
	};

	setup.onDone = function (response) {
	}

	var wrapper = require("../../");
	this.wrapper = new wrapper();
	this.wrapper.setup(setup);
	this.wrapper.setLowResolution(setLowRes);
}
test();
