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
	this.execute(
		'GetScopes',
		'',
		'',
		input.onDone,
		input.onFail
	);
	
};

//顯示目前所有 ipcam 狀態
onvifc.prototype.status = function (input) { 
	LOG.warn('connector status');
	LOG.warn(this.data);
	input.onDone({status:this.data}); 
};

onvifc.prototype.exit = function(input){
	input.onDone("GG");
}

onvifc.prototype.getStreamUri = function(input){
	var this_wrapper = this;
	//for error ip input
	var options = {
		host: this.data.host,
		port: 80,
		path: ''
	};

	new Cam(
		{
			hostname: this_wrapper.data.host,
			port: this_wrapper.data.port,
			username: this_wrapper.data.user,
			password: this_wrapper.data.passwd
		},function(err){
			this.getStreamUri(function(err, stream){
				input.onDone({
					"uristream" : stream
				});
			});
		}
	);
	
}

onvifc.prototype.getDeviceInformation = function(input){
	var this_wrapper = this;
	//for error ip input
	var options = {
		host: this_wrapper.data.host,
		port: 80,
		path: ''
	};
	//if http response, do get device info
//	http.get(options, function(res){
//		res.on('data', function(data){
			new Cam(
				{
					hostname: this_wrapper.data.host,
					port: this_wrapper.data.port,
					username: this_wrapper.data.user,
					password: this_wrapper.data.passwd
				},function(err){
					this.getDeviceInformation(function(err, stream){
						var Uri_stream;
		 				var cam_this = this;
						cam_this.getStreamUri(function(err, uri){
							Uri_stream = uri;
							if(typeof(stream) !== "undefined" && typeof(uri) !== "undefined"){
								console.log(stream);
								input.onDone({
									"Manufacturer" : stream.manufacturer,
									"Model" : stream.model,
									"Serial" : stream.serialNumber,
									"Version" : stream.firmwareVersion,
									"rtsp" : Uri_stream.uri
								});
							} else{
								input.onFail({
									"Error" : "NULL"
								});
							}
						});

					});
				}
			);
//		}).on('end', function(){
//			})
		//if on error
/*	}).on('error', function(){
		input.onFail({
			"Error" : "check your IP!"	
		});
	});*/
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
				input.onDone(stream);	
			});
		}
	);
};

onvifc.prototype.getVideoEncoderConfigurations = function (input) {
	this.execute(
		'GetVideoEncoderConfigurations',
		'',
		'',
		input.onDone,
		input.onFail
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
					input.onDone(stream);	
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
		},function(err){
			this.getVideoEncoderConfigurations(function(err, stream){
				if(input.channel == "ch_0") {
					input.onDone(stream[0]);
				} else {
					input.onDone(stream[1]);
				}
			});
		}
	);
	
};

onvifc.prototype.setVideoEncoderConfiguration = function (input) {
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
