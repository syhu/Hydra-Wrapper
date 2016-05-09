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

	var wrapper = require("../../");
	this.wrapper = new wrapper();
	console.log(this.wrapper.__proto__);
}
test();
