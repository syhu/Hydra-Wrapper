var fs = require("fs");
// FIXME, use global.path
var demosite = JSON.parse(fs.readFileSync("../../../Hydra-Connector-DVR/test/demosite.json", "utf8"));

test = function (input) {
	var self = this;

	var onDone = function (response) {
		console.log("onDone");
		if (typeof(response) !== "undefined") {
			console.log(response);
		}
	};

	var onFail = function (response) {
		console.log("onFail");
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
	};

	var stream = {
		"dataport": 50068,
		"onData": onData,
		"onDone": function (response) {
			console.log("stream.onDone");
			console.trace();
			console.log(onDone.toString());
			self.wrapper.disconnect({
				"onDone": console.log,
				"onFail": onFail
			});
		},
		"onFail": onFail,
		"streanIDs": [1,2,3,4]
	};

	var setup = {
		"onDone": function (response) {
			console.log("setup.onDone");
			console.trace();
			console.log(stream.onDone.toString());
			self.wrapper.connectStream(stream);
		},
		"onFail": onFail,
		"onNotify": onNotify,
		"device_type": "deeplet",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd
	};

	var wrapper = require("../../wrapper.js");
	this.wrapper = new wrapper();
//	console.log(setup.onDone.toString());
	this.wrapper.setup(setup);
}
test();
