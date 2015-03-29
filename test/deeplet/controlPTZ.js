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
		"Operation": "right-up",
		"ch": 0,
		"param": 0,
		"keyState": 0,
		"onDone": onDone,
		"onError": onError
	};

	var ptz = {
		"Operation": "right-up",
		"ch": 0,
		"param": 0,
		"keyState": 1,
		"onDone": onDone,
		"onError": onError
	};

	var l_ctrlPTZ = function (ptz_cmd) {
		var ptz_ctrl = setInterval (function () {
			if (ptz_cmd.keyState) {
				self.wrapper.controlPTZ(ptz_cmd);
				ptz_cmd.keyState = 0;
			} else {
				self.wrapper.controlPTZ(ptz_cmd);
				clearInterval(ptz_ctrl);
			}
		}, 500);
	}

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
		l_ctrlPTZ(ptz);
//		self.wrapper.controlPTZ(ptz);
	};

	var wrapper = require("../../wrapper.js");
	this.wrapper = new wrapper();
	this.wrapper.setup(setup);
}
test();
