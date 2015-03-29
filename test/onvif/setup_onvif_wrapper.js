var fs = require("fs");
var demosite = JSON.parse(fs.readFileSync("../../../../connector/onvif/test/demosite.json", "utf8"));

console.log(demosite);

test = function (input) {
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

	var setup = {
		"onDone": onDone,
		"onError": onError,
		"onNotify": onNotify,
		"device_type": "onvif",
		"host": demosite.host,
		"port": demosite.port,
		"user": demosite.user,
		"passwd": demosite.passwd
	}

	console.log("require wrapper\n");
	var wrapper = require("../../wrapper.js");
	console.log("create wrapper\n");
	this.wrapper = new wrapper();
	console.log("setup wrapper\n");
	this.wrapper.setup(setup);
//	console.log("this.wrapper.__proto__");
//	console.log(this.wrapper.__proto__);
}
test();
