/*
	Usage:
		var wrapper = require("wrapper.js");
		var deeplet = {
			"device_type": "deeplet",
			"address": "163.22.32.59",
			...
		};
		var connector = new wrapper(deeplet);

		connector.method(input);
*/

/* IC method */
if (typeof(LOG) === "undefined") {
	var LOG = {};
	if (typeof(LOG.warn) === "undefined") {
		LOG.warn = function (ret) {
			console.warn(ret);
		}
	}
	if (typeof(LOG.error) === "undefined") {
		LOG.error = function (ret) {
			console.error(ret);
		}
	}
	if (typeof(LOG.stack) == "undefined") {
		LOG.stack = function (ret) {
			console.trace();
		}
	}
}

function wrapper(input) {
	var wrapper_varA = "QAQ";
	var wrapper_varB = "@Q@";

	if (typeof(input) !== "undefined") {
		LOG.warn("input defined");
		this.setup(input);
	}

	return this;
}

wrapper.prototype.setup = function (input) {
	if (typeof(input) !== "undefined") {
		if (typeof(input.type) !== "undefined") {
			input.device_type = input.type;
		}
		switch (input.device_type) {
		case "onvif":
			var onvif = require("./devices/onvifc.js");

			this.prototype = this.__proto__;
			this.__proto__ = new onvif();
			console.log("this.__proto__");
			console.log(this.__proto__);
			onvif.call(this, input);
			this.init(input);
			break;

		case "deeplet":
			LOG.warn("require deeplet wrapper");
			var deeplet = require("./devices/deeplet.js");

			this.prototype = this.__proto__;
			this.__proto__ = new deeplet();
			deeplet.call(this, input);
			this.setupConnector(input);
			break;

		case "dvr":
			LOG.warn("require deeplet wrapper");
			var deeplet = require("./devices/deeplet.js");

			this.prototype = this.__proto__;
			this.__proto__ = new deeplet();
			deeplet.call(this, input);
			this.setupConnector(input);
			break;

		default:
			LOG.warn("not support");
		}
	}
}

wrapper.prototype.scanDevice = function (input) {
	// input.protocal
}

wrapper.prototype.wrapperMethod = function (input) {
	console.log("wrapperMethod");
}

module.exports = wrapper;
