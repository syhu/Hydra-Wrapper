var fs = require("fs");
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

	var ptz_stop = {
		"Operation": "left",
		"ch": 0,
		"param": 0,
		"keyState": 0,
		"onDone": onDone,
		"onError": onError
	};

	var ptz = {
		"Operation": "left",
		"ch": 0,
		"param": 0,
		"keyState": 1,
		"onDone": function (response) {
			self.wrapper.controlPTZ(ptz_stop)
		},
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
		self.wrapper.controlPTZ(ptz);
	};

	var wrapper = require("../../wrapper.js");
	this.wrapper = new wrapper();
	this.wrapper.setup(setup);
}
test();
