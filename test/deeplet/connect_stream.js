var fs = require("fs");
// FIXME, use global.path
var demosite = JSON.parse(fs.readFileSync("../../../Hydra-Connector-DVR/test/demosite.json", "utf8"));

test = function (input) {
	var self = this;
	var onDone = function (response) {
		console.log("onDone");
		if (typeof(response) !== "undefined")
			console.log(response);
	};
	var onError = function (response) {
		console.log("onError");
		console.log(response);
	};
	var onNotify = function (response) {
		console.log("onNotify");
		console.log(response);
	};
	var onData = function (response) {
		if (typeof(response) !== "undefined") {
			console.log("onData, ch: " + response.ch);
		}
	}

	var stream = {
		"dataport": 50068,
		"onData": onData,
		"onDone": onDone,
		"onError": onError
	};

	var setup = {
		"onDone": onDone,
		"onError": onError,
		"onNotify": onNotify,
		"device_type": "deeplet",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd
	};

	setup.onDone = function (response) {
		self.wrapper.connectStream(stream);
	};

	var wrapper = require("../../wrapper.js");
	this.wrapper = new wrapper();
	this.wrapper.setup(setup);
}
test();
