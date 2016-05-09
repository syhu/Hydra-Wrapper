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
	var onFail = function (response) {
		console.log("onFail");
		console.log(response);
	};
	var onNotify = function (response) {
		console.log("onNotify");
		console.log(response);
	};
	var onData = [
		function (response) {
			if (typeof(response) !== "undefined") {
				console.log("onData, ch: " + response.ch);
			}
		},
		function (response) {
			if (typeof(response) !== "undefined") {
				console.log("onData, ch: " + response.ch);
			}
		},
		function (response) {
			if (typeof(response) !== "undefined") {
				console.log("onData, ch: " + response.ch);
			}
		},
		function (response) {
			if (typeof(response) !== "undefined") {
				console.log("onData, ch: " + response.ch);
			}
		},
	]

	var stream = {
		"dataport": 50068,
		"onData": onData,
		"onDone": onDone,
		"onFail": onFail,
	};

	var setup = {
		"onDone": onDone,
		"onFail": onFail,
		"onNotify": onNotify,
		"device_type": "deeplet",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd,
		"streamIDs": [1,2,3,4]
	};

	setup.onDone = function (response) {
		self.wrapper.connectStream(stream);
	};

	var wrapper = require("../../");
	this.wrapper = new wrapper();
	this.wrapper.setup(setup);
}
test();
