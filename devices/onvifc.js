/* ImonCloud ONVIF connector for nodejs 
updated: 2014/07 

NOTE: 1) 此檔要全力避免使用 event.XXXX 2)

todo:
init 要加入判斷帳號/密碼是否正確 
	
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

//var onDone;

var sys = require('sys'); // http://nodejs.org/api.html#_child_processes
var exec = require('child_process').exec;
var Cam = require('onvif').Cam;
var discovery = require('onvif').Discovery;
var http = require('http');
var onvif = require('onvif');
var moment = require("moment");
//~ var child;

//var obj = {};

function onvifc(input) {
	// the constructor
	if (typeof(input) !== "undefined") {
		this.data = input;
		this.init(input);
	}
	return this;
}

onvifc.prototype.checkCallbacks = function (input) {
	if (typeof(input) !== "undefined") {
		if (typeof(input.onDone) === "undefined") {
			LOG.error("input.onDone = console.log");
			LOG.error(input);
			input.onDone = console.log;
		}
		if ((typeof(input.onFail) === "undefined") && (typeof(input.onError) === "undefined")) {
			LOG.error("input.onFail = console.log");
			LOG.error(input);
			input.onFail = console.log;
		} else if ((typeof(input.onFail) === "undefined") && typeof(input.onError !== "undefined")) {
			LOG.warn("input.onFail = input.onError");
			input.onFail = input.onError;
		}
	} else {
		LOG.error("input undefined");
		LOG.error("input.onDone = console.log");
		LOG.error("input.onFail = console.log");
		input.onDone = console.log;
		input.onFail = console.log;
	}
}

//~ var INIT = function (obj) {
onvifc.prototype.init = function (input) {
	this.data = input;
	LOG.warn('initiating: ip-' + this.data.host 
		+ ' port-' + this.data.port 
		+ ' username-' + this.data.user 
		+ ' password-' + this.data.passwd + ' ');

	input.onDone(this.__proto__);
	return this;
};

onvifc.prototype.autoScan = function(input){
	var this_wrapper = this;
	
	var cams = {};
	
	onvif.Discovery.on('device', function(cam, remoteInfo, responseXML){
	
		console.log("CAM - typeof: " + typeof(cam) + " - content - "); console.log(cam);
		console.log("RemoteInfo - typeof: " + typeof(remoteInfo) + " - content - "); console.log(remoteInfo);
		console.log("XML - typeof: " + typeof(responseXML) + " - content - "); console.log(""+responseXML);

		var myScopes = cam.probeMatches.probeMatch.scopes;
		if (myScopes._) {
			myScopes = myScopes._
		}
		var scopes = myScopes.toString().split(' ');
		var scopes_obj = {};
		Object.keys(scopes).forEach(function(key){
			var f = scopes[key].split('/')[3], b = scopes[key].split('/')[4];
			
			if (scopes_obj[f]) {
				scopes_obj[f] += (" " + b);
			} else {
				scopes_obj[f] = b;
			}
		});
		
		var address = cam.probeMatches.probeMatch.XAddrs.split('/')[2];
		var camData = {
			"IP" : address.split(':')[0],
			"Port" : address.split(':')[1],
			"endpointReference": cam.probeMatches.probeMatch.endpointReference,
			"Type": cam.probeMatches.probeMatch.types.split(':')[1],
			"Scopes": scopes_obj,
			"Path": cam.probeMatches.probeMatch.XAddrs
		};
		
		if ( camData.IP && typeof camData.Port == 'undefined') {
			camData.Port = 80
		};
		
		cams[address] = (camData);
	});

	onvif.Discovery.on("error", function (error) {
		console.log(error);
		// input.onFail ??
	});

	onvif.Discovery.probe({resolve: false}, function () {
		input.onDone( Object.keys(cams).map(function(address) { return cams[address]; }) );
	});


	/*
	discovery.probe(function(_null, rinfo){
		
		rinfo.forEach(function(cam){
			var ip = cam.hostname;
			var found = 0;
			cams.forEach(function(outcam){
				if(outcam.hostname == ip) {
					found = 1;
				}
			});

			if(!found) {
				cams.push(cam);
			}
		});

		console.log(typeof(cams));
		var outputs = [];
		var camCount = cams.length;
		cams.forEach(function (cam) {
			var thisCam = cam;
			var output = {
				"IP" : cam.hostname,
				"Port" : cam.port,
				"Path" : cam.path
			};

			var checkEmpty = 0;
			
			
			this_wrapper.getScopes({
				address: thisCam.hostname + ":" + thisCam.port,
				onDone: function (scopes) {
					cam.getDeviceInformation(function(err, stream) {
						
						console.log(camCount);
						console.log(stream);
						
						output.scopes = scopes;
						
						if(typeof(stream) === "undefined" ) {
							checkEmpty = 1;
						} else {
							output.Manufacturer = stream.manufacturer;
							output.Model = stream.model;
							output.Serial = stream.serial;
							output.Version = stream.version;
						}
						if(checkEmpty) {
							output.check = 0;
							outputs.push(output);
						} else {
							output.check = 1;
							outputs.push(output);
						}
						if(typeof(outputs) === "undefined"){
							input.onFail({
								"Error": "NO response"
							});
						} else{
							console.log("Finalllllllllllllllllllllllllllllllllll");
							console.log(outputs);
							if(0 == --camCount) {
								input.onDone(outputs);
							}
						}
					});
				}
			});

		});
	});
	*/
};

onvifc.prototype.getScopes = function (input) {
/*
	this.execute(
		'GetScopes',
		'',
		'',
		input.onDone,
		input.onFail
	);
*/
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getScopes(function(err, stream){
				if (stream) {
					input.onDone(stream);
				} else {
					input.onFail("password error");
				}
			
			});
		}
	);
		
};

onvifc.prototype.getHostname = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getHostname(function(err, stream){
				if (stream) {
					input.onDone(stream);
				} else {
					input.onFail("password error");
				}
			
			});
		}
	);
		
};

onvifc.prototype.getNTP = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getNTP(function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail("password error");
				}
			
			});
		}
	);
	
};

onvifc.prototype.setNTP = function (input) {
	var this_wrapper = this;
	var options = {};
	options.fromDHCP = input.fromDHCP;
	options.type = input.NTPtype;
	
	if (input.DNSname !== undefined) {
		options.DNSname = input.DNSname;
	}

	if (input.IPv4Address !== undefined) {
		options.IPv4Address = input.IPv4Address;
	}

	if (input.IPv6Address !== undefined) {
		options.IPv6Address = input.IPv6Address;
	}
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.setNTP(options, function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail("password error");
				}
			
			});
		}
	);
	
};
onvifc.prototype.getSystemDateAndTime = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getSystemDateAndTime(function(err, stream){
				if (stream) {
					input.onDone(stream);
				} else {
					input.onFail("password error");
				}
			
			});
		}
	);
	
};

onvifc.prototype.setSystemDateAndTime = function (input) {
	var options = {};
	options.dateTimeType = input.DateTimeType;
	options.daylightSavings = input.DaylightSavings;
	options.timezone = input.TimeZone;

/*	options.year = input.Year;
	options.month = input.Month;
	options.day = input.Day;
	options.hour = input.Hour;
	options.minute = input.Minute;
	options.second = input.Second;*/
	var time = {};
	var check = new moment({
		"year": input.Year,
		"month": input.Month,
		"day": input.Day,
	});

	if (input.Second >= 0 && input.Second < 60) {
		time.sec = input.Second;
	} else {
		input.onFail("second [0 - 59].");
		return;
	}
	if (input.Minute >=0 && input.Minute < 60) {
		time.min = input.Minute;
	} else {
		input.onFail("minute [0 - 59].");
		return;
	}
	if (input.Hour >= 0 && input.Hour < 24) {
		time.hour = input.Hour;
	} else {
		input.onFail("hour [0 - 23].");
		return;
	}

	if (input.Year >= 1900) {
		time.year = input.Year;
	} else {
		input.onFail("year [must greater than 1900].");
		return;
	}
	if (input.Month > 0 && input.Month < 13) {
		time.mon = input.Month - 1;
		// moment use 0 - 11
	} else {
		input.onFail("Month [1 - 12].");
		return;
	}
	if (parseInt(input.Day) > 0 && parseInt(input.Day) <= parseInt(check.endOf("month")._d.toString().split(" ")[2])) {
		// console.log(check.date());
		time.day = input.Day;
		check.date(input.Day);
	} else {
		console.log(check);
		input.onFail("day [1 - " + check.endOf("month")._d.toString().split(" ")[2] + "] (Year: " + check.year() + ", Month: "+ (check.month() + 1) + ")");
		return;
	}
	// time_settings.data.wday = check.day(); // sunday: 0, Saturday: 6
	// time_settings.data.yday = check.dayOfYear();

	// self.dvr_connector.set_sys_time(time_settings);


//	options.dateTime = moment.utc([time.year, time.mon, time.day, time.hour, time.min, time.sec, 0 /*millisecond*/]).valueOf();
	options.dateTime = new Date(time.year, time.mon, time.day, time.hour, time.min, time.sec, 0 /*millisecond*/);

	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.setSystemDateAndTime(options, function(err, stream){
				if (stream) {
					input.onDone(stream);
				} else {
					input.onFail("password error"); // ??
				}
			
			});
		}
	);
	
};

onvifc.prototype.setScopes = function (input) {
	var this_wrapper = this;
	local_obj = {
		onFail : input.onFail
	};

	local_obj.onDone = function (RET) {
		var local_obj_this = this;
//		var scopes = RET.scopes;
		var scopes = RET;
//		var scopes_obj = {};
		var scopes_arr = [];

		var exist = 0;
		Object.keys(scopes).forEach(function (key) {
			if (scopes[key].scopeDef === 'Configurable') {
				var real_key = scopes[key].scopeItem.split('/')[3],
				real_item = scopes[key].scopeItem.split('/')[4]

				var inputSet = 0;
				Object.keys(input).forEach(function (input_key) {
					if (input_key == real_key && typeof(input[input_key]) !== "undefined") {
//						scopes_obj[key] = scopes[key].scopeItem.replace(real_item, input[input_key]);
						scopes_arr.push(scopes[key].scopeItem.replace(real_item, input[input_key]));
						inputSet = 1;
					}
				});

				if (!inputSet) {
//					scopes_obj[key] = scopes[key].scopeItem;
					scopes_arr.push(scopes[key].scopeItem);
				}


				exist++;
			}
		});

		if (!exist) {
			this.onFail("No configurable item!!");
		} else {
			new Cam(
				{
					hostname: this_wrapper.data.host,
					port: this_wrapper.data.port,
					username: this_wrapper.data.user,
					password: this_wrapper.data.passwd
				},function(err){
//					this.setScopes(scopes_obj, function(stream){
					this.setScopes(scopes_arr, function(stream){
						if (!err) {
							input.onDone(stream);
						} else {
							local_obj_this.onFail("password error");
						}
			
					});
				}
			);
		}
		
	};

	this.getScopes(local_obj);
};
//顯示目前所有 ipcam 狀態
onvifc.prototype.status = function (input) { 
	LOG.warn('connector status');
	LOG.warn(this.data);
	input.onDone({status:this.data}); 
};

onvifc.prototype.exit = function(input) {
	this.disconnect(input);
}

onvifc.prototype.disconnect = function(input) {
	if (typeof(input) !== "undefined") {
		this.checkCallbacks(input);
		input.onDone("GG");
	}
}

onvifc.prototype.getProfiles = function (input) {
	var self = this;
	new Cam(
		{
			"hostname": self.data.host,
			"port": self.data.port,
			"username": self.data.user,
			"password": self.data.passwd
		},
		function (err) {
			if (err) {
				LOG.error(err);
				return;
			}
			this.getProfiles(function (error, profiles) {
				if (error) {
					console.log(error);
					return;
				}
				if (profiles) {
					// console.log(profiles);
					/*for (var i = 0; i < profiles.length; i++) {
						console.log(profiles[i].$.token);
					}*/
					input.onDone({"Profiles": profiles});
				} else {
					input.onFail(error);
				}
			});
		}
	);
}

onvifc.prototype.getStreamUri = function(input) {
	var self = this;
	var uri = [];
	var get_profiles_param = {
		"onDone": function (profiles) {

			var recursive_call = function (stop) {
				new Cam(
					{
						hostname: self.data.host,
						port: self.data.port,
						username: self.data.user,
						password: self.data.passwd
					},function (err) {
						if (err) {
							LOG.error("err");
							LOG.error(err);
						}
						this.getStreamUri(
							{
								"profileToken": profiles.Profiles[stop].$.token
							},
							function(err, stream) {
								var done = 0;
								uri[stop] = stream.uri;
								stop++;
								if (stop == profiles.Profiles.length) {
									input.onDone({
										"uristream" : uri
									});
								} else {
									recursive_call(stop);
								}
							}
						);
					}
				);
			}
			recursive_call(0);
		},
		"onFail": input.onFail
	};

	this.getProfiles(get_profiles_param);
	
}

onvifc.prototype.getDeviceInformation = function(input){
	var this_wrapper = this;
	var self = this;
	var local_obj = {
		onFail: input.onFail
	};
	//for error ip input
	var options = {
		host: this_wrapper.data.host,
		port: 80,
		path: ''
	};

	local_obj.onDone = function(RET) {
		var scopes = RET;
		var scopes_obj = {};

		Object.keys(scopes).forEach(function (key) {
			var f = scopes[key].scopeItem.split('/')[3],
			b = scopes[key].scopeItem.split('/')[4];

			if (scopes_obj[f]) {
				scopes_obj[f] += (" " + b);
			} else {
				scopes_obj[f] = b;
			}
		});
		
		// console.log("scope_obj");
		// console.log(scopes_obj);
		new Cam(
			{
				hostname: this_wrapper.data.host,
				port: this_wrapper.data.port,
				username: this_wrapper.data.user,
				password: this_wrapper.data.passwd
			},function(err){
				this.getDeviceInformation(function (err, stream) { /* stream ????? */
					if(err) {
						console.log(err);
						input.onFail(err);
					} else {

						self.getStreamUri({
							"onDone": function (uri) {
								if(typeof(stream) !== "undefined" && typeof(uri) !== "undefined" && typeof(scopes_obj !== "undefined")){
									console.log(stream);
									input.onDone({
										"Name" : scopes_obj.name,
										"Type" : scopes_obj.type,
										"Location" : scopes_obj.location,
										"Harware" : scopes_obj.hardware,
										"Manufacturer" : stream.manufacturer,
										"Model" : stream.model,
										"Serial" : stream.serialNumber,
										"Version" : stream.firmwareVersion,
										"rtsp" : uri.uristream
									});
								} else{
									input.onFail(err);
								}
							},
							"onFail": input.onFail
						});
					}
				});
			}
		);
	}

	this_wrapper.getScopes(local_obj);
};

onvifc.prototype.getVideoSources = function (input) {
/*
	this.execute(
		'GetVideoSources',
		'',
		'',
		input.onDone,
		input.onFail
	);
*/
	var this_wrapper = this;
	new Cam (
	{
		hostname: this_wrapper.data.host,
		port: this_wrapper.data.port,
		username: this_wrapper.data.user,
		password: this_wrapper.data.passwd
		
	}, function (err) {
			this.getVideoSources(function(err, stream){
				if(stream) {
					input.onDone(stream);	
				} else {
					input.onFail("password error");
				}
			});
		}
	);
};

onvifc.prototype.getVideoEncoderConfigurations = function (input) {
	var this_wrapper = this;
	new Cam (
	{
		hostname: this_wrapper.data.host,
		port: this_wrapper.data.port,
		username: this_wrapper.data.user,
		password: this_wrapper.data.passwd
		
	}, function (err) {
			this.getVideoEncoderConfigurations(function(err, stream){
				if(!err) {
					input.onDone(stream);	
				} else {
					input.onFail(err);
				}
			});
		}
	);
	
};

onvifc.prototype.getAudioSources = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getAudioSources(function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail(err);
				}
			
			});
		}
	);
		
};

onvifc.prototype.getAudioSourceConfigurations = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getAudioSourceConfigurations(function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail(err);
				}
			
			});
		}
	);
		
};

onvifc.prototype.getAudioEncoderConfigurations = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getAudioEncoderConfigurations(function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail(err);
				}
			
			});
		}
	);
		
};

onvifc.prototype.getAudioOutputs = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getAudioOutputs(function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail(err);
				}
			
			});
		}
	);
		
};

onvifc.prototype.getAudioOutputConfigurations = function (input) {
	var this_wrapper = this;
	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getAudioOutputConfigurations(function(err, stream){
				if (!err) {
					input.onDone(stream);
				} else {
					input.onFail(err);
				}
			
			});
		}
	);
		
};

onvifc.prototype.getImagingSettings = function (input) {
	var token, argv4, this_wrapper = this;
	var local_obj = {
		onFail: input.onFail
	};

	local_obj.onDone = function(RET) {
		getToken = RET.$["token"];
/*
		argv4 = " --Channel " + token;

		this_wrapper.execute(
			'GetImagingSettings',
			'',
			argv4,
			input.onDone,
			local_obj.onFail
		);
*/
		new Cam (
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
			
		}, function (err) {
				this.getImagingSettings({token: getToken}, function(err, stream){
					if(stream) {
						input.onDone(stream);	
					} else {
						input.onFail("password error");
					}
				});
			}
		);
	};

	this_wrapper.getVideoSources(local_obj);
	
};

onvifc.prototype.setImagingSettings = function (input) {
	var token, argv4, this_wrapper = this;
	var local_obj = {
		onFail: input.onFail
	};

	local_obj.onDone = function(RET) {
		var imagSet = {};
		imagSet.token = RET.$["token"];

		Object.keys(input).forEach ( function (key) {
			if(key !== 'channel' && key !== 'onDone' && key !== 'onFail') {
				imagSet[key] = input[key];
			}
		});

//		console.log("ImagSet");
//		console.log(imagSet);

		new Cam (
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
			
		}, function (err) {
				this.setImagingSettings(imagSet, function(err, stream){
					if(stream) {
						input.onDone(stream);
					} else {
						input.onFail("password error");
					}
				});
			}
		);
		
/*
		if(!(typeof(input.brightness) === "undefined"))
			if(typeof(argv4) !== "undefined")
				argv4 += " --Brightness " + input.brightness;
			else	argv4 = " --Brightness " + input.brightness;
	
		if(!(typeof(input.colorsaturation) === "undefined"))
			if(typeof(argv4) !== "undefined")
				argv4 += " --ColorSaturation " + input.colorsaturation;
			else	argv4 = " --ColorSaturation " + input.colorsaturation;

		if(!(typeof(input.contrast) === "undefined"))
			if(typeof(argv4) !== "undefined")
				argv4 += " --Contrast " + input.contrast;
			else	argv4 = " --Contrast " + input.contrast;

		if(!(typeof(input.sharpness) === "undefined"))
			if(typeof(argv4) !== "undefined")
				argv4 += " --Sharpness " + input.sharpness;
			else	argv4 = " --Sharpness " + input.sharpness;

		token = RET.GetVideoSources.VideoSources["token"];
		argv4 += " --Channel " + token;

		this_wrapper.execute(
			'SetImagingSettings',
			'',
			argv4,
			input.onDone,
			local_obj.onFail
		);
*/
	};

	this_wrapper.getVideoSources(local_obj);
	
};

onvifc.prototype.getVideoEncoderConfiguration = function (input) {
/*
	var token, argv4, this_wrapper = this;
	var local_obj = {
		onFail: input.onFail
	};

	local_obj.onDone = function(RET) {
		if(input.channel == "ch_0")
			token = RET.token0;
		else token = RET.token1;
		argv4 = " --EncoderChannel " + token;

		this_wrapper.execute(
			'GetVideoEncoderConfiguration',
			'',
			argv4,
			input.onDone,
			local_obj.onFail
		);
	};

	this_wrapper.getVideoEncoderConfigurations(local_obj);
*/
	var this_wrapper = this;

	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		}, function (err) {
			this.getVideoEncoderConfigurations(
				function (err, stream) {
					if(!err) {
						if (input.token) {
							try {
								Object.keys(stream).forEach(
									function (key) {
										if (stream[key].$.token === input.token) {
											input.onDone(stream[key]);
										}
									}
								);
							} catch (error) {
								input.onFail(error);
							}
						} else {
							input.onDone(stream[0]);
						}
					} else {
						input.onFail(err);
					}
				}
			);
		}
	);
	
};

// FIXME: refactor needed
onvifc.prototype.setVideoEncoderConfiguration = function (input) {
	var this_wrapper = this, 
		options = {},	//setVideoEncoderConfiguration connector settings parm 
		local_obj = {};	//getVideoEncoderConfiguration wrapper input
		channel = input.channel || 0; // default: first encoder

	if (input.token) {
		//for getVideoEncoderConfiguration
		local_obj.token = input.token;
	}

	local_obj.onDone = function (RET) {
		options.token = RET[channel].$.token;
		options.name = input.name || RET[channel].name;
		options.useCount = input.useCount || RET[channel].useCount;
		options.encoding = input.encoding || RET[channel].encoding;
		/*options.width = input.width || RET[channel].resolution.width;
		options.height = input.height || RET[channel].resolution.height;*/
		options.resolution = {};
		options.resolution.width = input.width || RET[channel].resolution.width;
		options.resolution.height = input.height || RET[channel].resolution.height;
		options.quality = input.quality || RET[channel].quality;
		options.bitRate = input.bitRate || RET[channel].rateControl.bitrateLimit;
		options.frameRate = input.frameRate || RET[channel].rateControl.frameRateLimit;
		options.encodingInterval = input.encodingInterval || RET[channel].rateControl.encodingInterval;
		if (RET[channel].hasOwnProperty('MPEG4')) {
			if (RET[channel].MPEG4.hasOwnProperty('govLength')) {
				options.MPEG4govLength = RET[channel].MPEG4.govLength;
			}
			if (RET[channel].MPEG4.hasOwnProperty('mpeg4Profile')) {
				options.MPEG4profile = RET[channel].MPEG4.mpeg4Profile;
			}
		}
		options.H264govLength = input.govLength || RET[channel].H264.govLength;
		options.H264profile = input.profile || RET[channel].H264.H264Profile;
		options.multicastAddressType = RET[channel].multicast.address.type;
		options.multicastAddress = RET[channel].multicast.address.IPv4Address;
		options.multicastPort = RET[channel].multicast.port;
		options.multicastTTL = RET[channel].multicast.TTL;
		options.multicastAutoStart = RET[channel].multicast.autoStart;
		options.sessionTimeout = RET[channel].sessionTimeout;

		new Cam(
			{
				hostname: this_wrapper.data.host,
				port: this_wrapper.data.port,
				username: this_wrapper.data.user,
				password: this_wrapper.data.passwd
			},
			function (err) {
				if (err) {
					LOG.error(err);
					return;
				}
				this.setVideoEncoderConfiguration(
					options,
					function(err, stream) {
						if (!err) {
							if (typeof (stream) !== "undefined") {
								if (typeof (stream.$) !== "undefined") {
									if (stream.$.token === options.token) {
										input.onDone(stream);
									}
								}
							}
						} else {
							input.onFail(err);
						}
					}
				);
			}
		);
		
	}; 
	
	local_obj.onFail = input.onFail;

	this.getVideoEncoderConfigurations(local_obj);
};

onvifc.prototype.setLowResolution = function (input) {
	var self = this;
	this.checkCallbacks(input);

	input.channel = ((input.channel) ? 1 : 0);

	var setLowRes = {
		"onDone": input.onDone,
		"onFail": input.onFail,
		"channel": input.channel,
		"width": 352,
		"height": 240,
		"frameRate": 10
	};

	this.setVideoEncoderConfiguration(setLowRes);
}

onvifc.prototype.setHighResolution = function (input) {
	var self = this;
	this.checkCallbacks(input);

	input.channel = ((input.channel) ? 1 : 0);

	var setHighRes = {
		"onDone": input.onDone,
		"onFail": input.onFail,
		"channel": input.channel,
		"width": 1920,
		"height": 1080,
		"frameRate": 30
	};

	this.setVideoEncoderConfiguration(setHighRes);
}

onvifc.prototype.c_version_setVideoEncoderConfiguration = function (input) {
	var token, argv4, this_wrapper = this;
	var local_obj = {
		onFail: input.onFail
	};

	local_obj.onDone = function(RET) {
//for Encoder setting
		if(input.framerate !== "undefined")
			if(typeof(argv4) !== "undefined")
				argv4 += " --FrameRate " + input.framerate;
			else argv4 += " --FrameRate " + input.framerate;
	
		if(input.bitrate !== "undefined")
			if(typeof(argv4) !== "undefined")
				argv4 += " --BitRate " + input.bitrate;
			else argv4 += " --BitRate " + input.bitrate; 

		if(input.quality !== "undefined")
			if(typeof(argv4) !== "undefined")
				argv4 += " --Quality " + input.quality;
			else argv4 += " --Quality " + input.quality;

		if(input.resolution_width !== "undefined")
			if(typeof(argv4) !== "undefined")
				argv4 += " --ResolutionWidth " + input.resolution_width;
			else argv4 += " --ResolutionWidth " + input.resolution_width;

		if(input.resolution_height !== "undefined")
			if(typeof(argv4) !== "undefined")
				argv4 += " --ResolutionHeight " + input.resolution_height;
			else argv4 += " --ResolutionHeight " + input.resolution_height;
//for channel setting
		if(input.channel == "ch_0")
			token = RET.token0;
		else token = RET.token1;

		argv4 += " --EncoderChannel " + token;

		this_wrapper.execute(
			'SetVideoEncoderConfiguration',
			'',
			argv4,
			input.onDone,
			local_obj.onFail
		);
	};

	this_wrapper.getVideoEncoderConfigurations(local_obj);
	
};

// 傳回 ipcam 的硬體資訊 
onvifc.prototype.getHardwareInfo = function (input) {
	console.log("onvifc.prototype.getHardwareInfo: this.data: ", this.data);
	console.log("getHardwareInfo: input", input);
	console.log("Hardware type :", typeof(input.onDone));
	this.execute(
		'GetDeviceInformation',
		this.data.ip,
		'',
		input.onDone,
		input.onFail
	);
};

//顯示網路設定
onvifc.prototype.getNetworkInfo = function (input) {
	LOG.warn(input);
	this.execute(
		'GetNetworkInterfaces',
		this.data.ip,
		'',
		function (input) {
			input.onDone({status:out});
		},
		function (err) {
			input.onFail(err);
		}
	); 
};

/*
onvifc.prototype.brightness = function (val) {
//	LOG.warn(obj);
	var argv4;
	execute("SetImagingSettings", obj.ip, '', function(out) {
		obj.onDone({status:out});
	});
}
*/

onvifc.prototype.brightness = function (input) {
	var wrapper_obj = this.obj;
	var local_obj = {
		onFail: input.oniFail
	};

	var this_connector = this;
	local_obj.onDone = function (ret) {
		var obj_setting = {
			onFail: local_obj.onFail
		};
//		ret[1].GetImagingSettings.ImagingSettings.Brightness = obj_in.value;
		obj_setting.operation = "SetImagingSettings";
		obj_setting.argv4 =
			" --Brightness " + input.value//ret[1].GetImagingSettings.ImagingSettings.Brightness
			+ " --ColorSaturation " + ret[0].GetImagingSettings.ImagingSettings.ColorSaturation
			+ " --Contrast " + ret[0].GetImagingSettings.ImagingSettings.Contrast
			+ " --Sharpness " + ret[0].GetImagingSettings.ImagingSettings.Sharpness
			+ " --Channel " + input.channel;
		obj_setting.onDone = function () {
			input.onDone(ret[0].GetImagingSettings.ImagingSettings);
		};
		this_connector.execOperation(obj_setting);
	};
	local_obj.channel = input.channel;
	this.getImagingSettings(local_obj);
/*
	var out = function (output) {
		var currentSettings = obj_in.debug['GetImagingSettings'].GetImagingSettings.ImagingSettings;
		LOG.warn(currentSettings);
		var argv4 = '';
		var Bri = parseInt(currentSettings.Brightness);
		var Col = parseInt(currentSettings.ColorSaturation);
		var Con = parseInt(currentSettings.Contrast);
		var Sha = parseInt(currentSettings.Sharpness);
		
		if (typeof obj_in.control === 'undefined' ) {
			LOG.warn('get current brightness setting');
				var ret_obj = {
					"Brightness" : Bri,
					"ColorSaturation" : Col,
					"Contrast" : Con,
					"Sharpness" : Sha
				};
				obj_in.onDone(ret_obj);
				return;
		}
		
		switch(obj_in.control){
			case 'increase':
				Bri = Bri + 15;
				if (Bri < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					this.execute(
						'SetImagingSettings',
						ip,
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						}
					);
				}
				break;
				
			case 'decrease':
				Bri = Bri - 15;
				if (Bri < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					this.execute(
						'SetImagingSettings',
						ip,
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						}
					);
				}
				break;
				
			default:
				LOG.warn('switch-default');
				break;
		} //end of switch
	};
	this.execute('GetImagingSettings', this.obj.ip, '', out, obj_in.onError);
*/
};

// refactored above

onvifc.prototype.colorSaturation = function (input) {  
	var wrapper_obj = this.obj;
	var local_obj = {
		onFail: input.onFail
	};

	var this_connector = this;
	local_obj.onDone = function(ret){
		var obj_setting = {
			onFail: local_obj.onFail
		};
		obj_setting.operation = "SetImagingSettings";
		obj_setting.argv4 = 
			" --Brightness " + ret[1].GetImagingSettings.ImagingSettings.Brightness
			+ " --ColorSaturation " + input.value
			+ " --Contrast " + ret[1].GetImagingSettings.ImagingSettings.Contrast
			+ " --Sharpness " + ret[1].GetImagingSettings.ImagingSettings.Sharpness;
		obj_setting.onDone = function(){
			input.onDone(ret[1].GetImagingSettings.ImagingSettings);
		};
		this_connector.execOperation(obj_setting);
	};
	
	local_obj.operation = "GetImagingSettings";
	this.execOperation(local_obj);

/*
	var out = function (output) {
		var currentSettings = obj_in.debug['GetImagingSettings'].GetImagingSettings.ImagingSettings;
		LOG.warn(currentSettings);
		var argv4 = '';
		var Bri = parseInt(currentSettings.Brightness);
		var Col = parseInt(currentSettings.ColorSaturation);
		var Con = parseInt(currentSettings.Contrast);
		var Sha = parseInt(currentSettings.Sharpness);
		
		if (typeof obj_in.control === 'undefined' ) {
			LOG.warn('get current brightness setting');
				var ret_obj = {
					"Brightness" : Bri,
					"ColorSaturation" : Col,
					"Contrast" : Con,
					"Sharpness" : Sha
				};
				obj_in.onDone(ret_obj);
				return;
		}
		
		switch(obj_in.control){
			case 'increase':
				Col = Col + 15;
				if (Col < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					this.execute(
						'SetImagingSettings', 
						ip, 
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.omDone(obj_in.control, argv4);
						} 
					);
				}
				break;
				
			case 'decrease':
				Col = Col - 15;
				if (Col < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					this.execute(
						'SetImagingSettings', 
						ip, 
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						} 
					);
				}
				break;
				
			default:
				LOG.warn('switch-default');
				break;
		} //end of switch
	};
	this.execute('GetImagingSettings', this.obj.ip, '', out, obj_in.onError);
*/
};


onvifc.prototype.contrast = function (input) {  
	var wrapper_obj = this.obj;
        var local_obj = {
                onFail: input.onFail
        };

        var this_connector = this;
        local_obj.onDone = function(ret){
                var obj_setting = {
                        onFail: local_obj.onFail
                };
                obj_setting.operation = "SetImagingSettings";
                obj_setting.argv4 =
                        " --Brightness " + ret[1].GetImagingSettings.ImagingSettings.Brightness
                        + " --ColorSaturation " + ret[1].GetImagingSettings.ImagingSettings.ColorSaturation
                        + " --Contrast " + input.value
                        + " --Sharpness " + ret[1].GetImagingSettings.ImagingSettings.Sharpness;
                obj_setting.onDone = function(){
                        input.onDone(ret[1].GetImagingSettings.ImagingSettings);
                };
                this_connector.execOperation(obj_setting);
        };

        local_obj.operation = "GetImagingSettings";
        this.execOperation(local_obj);
/*	var obj_in = obj;
	var out = function (output) {
		var currentSettings = obj_in.debug['GetImagingSettings'].GetImagingSettings.ImagingSettings;
		LOG.warn(currentSettings);
		var argv4 = '';
		var Bri = parseInt(currentSettings.Brightness);
		var Col = parseInt(currentSettings.ColorSaturation);
		var Con = parseInt(currentSettings.Contrast);
		var Sha = parseInt(currentSettings.Sharpness);
		
		if (typeof obj_in.control === 'undefined' ) {
			LOG.warn('callback function');
				var ret_obj = {
					"Brightness" : Bri,
					"ColorSaturation" : Col,
					"Contrast" : Con,
					"Sharpness" : Sha
				};
				obj_in.onDone(ret_obj);
				return;
		}
		
		switch(obj_in.control){
			case 'increase':
				Con = Con + 15;
				if (Con < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					this.execute(
						'SetImagingSettings', 
						ip, 
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						} 
					);
				}
				break;
				
			case 'decrease':
				Con = Con - 15;
				if (Con < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					//LOG.warn('brightnessDecrease');
					this.execute(
						'SetImagingSettings', 
						ip, 
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						} 
					);
				}
				break;
				
			default:
				LOG.warn('switch-default');
				break;
		} //end of switch
	};
	this.execute('GetImagingSettings', this.obj.ip, '', out, obj_in.onError);
*/
};


onvifc.prototype.sharpness = function (input) {  
	var wrapper_obj = this.obj;
        var local_obj = {
                onFail: input.onFail
        };

        var this_connector = this;
        local_obj.onDone = function(ret){
                var obj_setting = {
                        onFail: local_obj.onFail
                };
                obj_setting.operation = "SetImagingSettings";
                obj_setting.argv4 =
                        " --Brightness " + ret[1].GetImagingSettings.ImagingSettings.Brightness
                        + " --ColorSaturation " + ret[1].GetImagingSettings.ImagingSettings.ColorSaturation
                        + " --Contrast " + ret[1].GetImagingSettings.ImagingSettings.Contrast
                        + " --Sharpness " + input.value;
                obj_setting.onDone = function(){
                        input.onDone(ret[1].GetImagingSettings.ImagingSettings);
                };
                this_connector.execOperation(obj_setting);
        };

        local_obj.operation = "GetImagingSettings";
        this.execOperation(local_obj);

/*	var obj_in = obj;
	var out = function (output) {
		var currentSettings = obj_in.debug['GetImagingSettings'].GetImagingSettings.ImagingSettings;
		LOG.warn(currentSettings);
		var argv4 = '';
		var Bri = parseInt(currentSettings.Brightness);
		var Col = parseInt(currentSettings.ColorSaturation);
		var Con = parseInt(currentSettings.Contrast);
		var Sha = parseInt(currentSettings.Sharpness);
		
		if (typeof obj_in.control === 'undefined' ) {
			LOG.warn('callback function');
				var ret_obj = {
					"Brightness" : Bri,
					"ColorSaturation" : Col,
					"Contrast" : Con,
					"Sharpness" : Sha
				};
				obj_in.onDone(ret_obj);
				return;
		}
		
		switch (obj_in.control) {
			case 'increase':
				Sha = Sha + 15;
				if (Sha < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					this.execute(
						'SetImagingSettings', 
						ip, 
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						} 
					);
				}
				break;
				
			case 'decrease':
				Sha = Sha - 15;
				if (Sha < 255) {
					argv4 = argv4 + Bri + " " + Col + " " + Con + " " + Sha ;
					//LOG.warn('brightnessDecrease');
					this.execute(
						'SetImagingSettings', 
						ip, 
						argv4, 
						function (out) {
							LOG.warn(obj_in.control);
							obj_in.onDone(obj_in.control, argv4);
						} 
					);
				}
				break;
				
			default:
				LOG.warn('switch-default');
				break;
		} //end of switch
	};
	this.execute('GetImagingSettings', this.obj.ip, '', out, obj_in.onError);
*/
};



// refactored below

/////// 以下不是用 RSG-id 呼叫的方式 ///////// 

onvifc.prototype.execOperation = function(input) {
	console.log("onvifc.prototype.execOperation: obj: ", input);
	console.log("onvifc.prototype.execOperation: this.obj: ", this.data);
	this.execute(input.operation, this.data.ip, input.argv4, input.onDone, input.onFail);
};

/* 
onvifc.prototype.saveObj = function (obj) {
	this.boj = obj;
};

onvifc.prototype.getObj = function (prop) {
	if (prop) {
		return this.obj[prop];
	} else {
		return this.obj;
	}
};
*/

onvifc.prototype.execute = function (operation, ip, argv4, onDone, onFail) {
	var wrapper_data = this.data;
	var targetIP, targetPort;
	if (ip) {	// 1.2.3.4:80
		targetIP = split(/:/,ip)[0];
		targetPort = split(/:/,ip)[1];
	} else {
		targetIP = this.data.host;
		targetPort = this.data.port;
	}
//	var saveObj = this.saveObj;
	
	var command;
	if (operation == "Probe") {
		command = "./connector/onvif/probe";
	} else {
		switch (process.platform) {
			case 'linux':
				command = './connector/onvif/onvifc ';
			break;
			
			case 'win32':
				command = '.\\connector\\onvif\\onvifc.exe ';
			break;
			
			default:
				console.log("incompatible platform");
				process.exit(99);
			break;
		}
		command += "--operation " + operation + " --ip " + targetIP + " --port " + targetPort + " --username " + this.data.user + " --password " + this.data.passwd;
	}
	
	if (argv4) {
		command = command + " " + argv4;
		console.log(command);
	}
	
	
	
	LOG.warn(command);
//	exec(command, );
	exec(command, function (error, stdout, stderr) {

		try {
			var output = {};
			
			if (stderr) {
				console.log(stderr);
				output = JSON.parse(stderr); //如果 stderr 存在就吃 stder
				console.log("this is sterr:", stderr);
				console.log("for output", output);
			}
//			else {
			if (stdout) {
				console.log("exec STDOUT: " + stdout);
				output = JSON.parse(stdout); //否則就吃 stdou
				console.log("for output", output);
			}
		
			LOG.warn('jsonOnvifOut: ', output);
			console.log('jsonOnvifOut: ', output);
			//~ LOG.warn(output);
			console.log("exec: wrapper_data: ", wrapper_data);
			
			/*output.*/debug = {};
			for (var key in output){
				//LOG.warn("ccc");
				//LOG.warn(key);
				LOG.warn("output[key][operation]", output[key][operation]);
				console.log("output[key][operation]", output[key][operation]);
				/*output.*/debug[key] = output[key];
				switch (key) {
				case '0':
					/*output.*/debug[operation] = /*output.*/debug['0'];
					delete /*output.*/debug['0'];
					break;
				case '1':
					/*output.*/debug[operation] = /*output.*/debug['1'];
					delete /*output.*/debug['1'];
					break;
				case '2':
					/*output.*/debug[operation] = /*output.*/debug['2'];
					delete /*output.*/debug['2'];
					break;
				case '3':
					/*output.*/debug[operation] = /*output.*/debug['3'];
					delete /*output.*/debug['3'];
					break;
				default:
					break;
				}
			}
			

			//todo: 此處要判斷是否 soap error
			
			console.log("done exec");
			//~ console.log("done exec, saving obj");
			//~ saveObj(obj);
			//~ console.log("obj saved");
			
			console.log("typeof onDone: ", typeof(onDone));

			onDone(output);

		} catch (err) {
			LOG.warn('Wrong: ' + err + "\n\n" + err.message);
			sys.print('stdout: ' + stdout);
			sys.print('stderr: ' + stderr);
			onFail({'error:': 'onvifc has error, please check! '});
			return;
		}

		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
	console.log("done excute");
}

//global.onvifc = onvifc;
module.exports = onvifc;
/*
module.exports = {
	onvifc: onvifc;
};
*/
