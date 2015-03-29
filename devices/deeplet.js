var moment = require("moment");
//~ var dvr_connector = require('../connector/dvr_deeplet/dvr_connector.js'); // 目前 dvr connector 採非物件導向 // ??, sunnyworm

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

var notSupport = function (input) {
	input.onError({'onError':'not support'});
}

function deeplet(input) {
	if (typeof(input) !== "undefined") {
		// 若有給 input 可順便一起 init
		console.log(input);
		this.setupConnector(input);
	}

	return this;
}

// create and initialize connector
deeplet.prototype.setupConnector = function (input) {
	LOG.warn('setupDeepletConnector');

	if (typeof(input.host) === "undefined") {
		LOG.error("deeplet wrapper: input.host undefined");

		if (typeof(input.port) === "undefined") {
			LOG.error("deeplet wrapper: input.port undefined");
		}

		if (typeof(input.onError) === "undefined") {
			LOG.warn("deeplet wrapper: input.onError undefined");
			LOG.warn(input);
		} else {
			input.onError("deeplet wrapper: please check input.host and input.port" + input);
		}

		return input;
	}

	if (typeof(this.data) !== "undefined") {
		if (this.data.host == input.host && this.data.port == input.port) {
			input.onDone("deeplet connector already exists");
			return this;
		}
	}

	//~ input.self = this;
	this.data = input;
	var init_obj = input;

	// check onDone
	if (typeof(input.onDone) === "undefined") {
		LOG.warn("deeplet wrapper: input.onDone undefined");
		input.onDone = function (returns) {
			LOG.warn("deeplet wrapper: setupConnector onDone\n" + returns);
		};
	}

	// check onNotify
	if (typeof(input.onNotify) === "undefined") {
		LOG.warn("deeplet wrapper: input.onNotify undefined");
		input.onNotify = function (returns) {
			LOG.warn("deeplet wrapper: setupConnector onNotify\n" + returns);
		}
	}

	// check dataport
	if (typeof(input.dataport) === "undefined") {
		LOG.warn("deeplet wrapper: input.dataport undefined", input);
	} else {
		if (typeof(input.onData) !== "undefined") {
			var stream_data = {
				"dataport": input.dataport,
				"onData": input.onData,
				"onDone": input.onDone,
				"onError": input.onError,
			};
		}
	}

	// check connector path
	if (typeof(global) === "undefined" || typeof(global.g_settings) === "undefined" || typeof(global.g_settings.path) === "undefined") {
		// local testing
		LOG.warn("global.g_settings.path undefined");
		var connector = require("../../Hydra-Connector-DVR/dvr_connector_OO.js");

	} else if (typeof(global) !== "undefined" && typeof(global.g_settings) !== "undefined" && typeof(global.g_settings.path) === "undefined") {
		// libPath undefined
		var connector = require("../../connector/dvr_deeplet/dvr_connector_OO.js");

	} else {
		var connector = require(global.g_settings.path.base + "/connector/dvr_deeplet/dvr_connector_OO.js");
	}

	// create connector
	LOG.warn("create connector");
	this.dvr_connector = new connector();
	var this_wrapper = this;
	var login_data = {
		"onDone": input.onDone,
		"onError": input.onError,
		"user": input.user,
		"passwd": input.passwd,
	};

	if (typeof(stream_data) !== "undefined") {
		login_data.onDone = function (returns) {
			this_wrapper.dvr_connector.strm(stream_data);
		};
	}

	init_obj.onDone = function (returns) {
		this_wrapper.dvr_connector.login(login_data);
	};

	this.dvr_connector.init(init_obj);
}

// FIXME
deeplet.prototype.getConnectorStatus = function (input) { 
	LOG.warn('onvif&wrapper-STATUS'); // 顯示 dvr 或 onvif connector 的狀態
	notSupport(input);
}


//executable
deeplet.prototype.getWrapperStatus = function (input) {
	LOG.warn('wrapper-STATUS'); // 顯示 wrapper 本身的狀態 
	LOG.warn(this.data);
	input.onDone(this.data);
	return;
	// 如果有喂 ip 進來，就只顯示該筆資料，若無，則顯示全部資料 
	//if (input.hasOwnProperty('ip') && input.ip !== undefined ) 
	//	input.onDone(wrapperPool[input.ip]);
	//else if ( ! input.hasOwnProperty('ip') || input.ip == undefined ) 
	//	input.onDone(wrapperPool); 
}


// todo: 可以有精簡模式(model,serial number) 及 全部詳細模式 
deeplet.prototype.getHardwareInfo = function (input) {
	var normalizedHardwareInfo = {};

	var get_info = {
		"onDone": function (ret) {
			LOG.warn("wrapper-HW-CB-dvr");
			var normalizedHardwareInfo = {
				"Model": ret.Model,
				"Serial": ret.Serial,
				"Version": ret.SWVersion,
				"Screens": ret.Screens,
				// "rawdata" : ret // NumOfCameras, Audios, AIs, AOs, Encoders, Decoders
			};
			if (input.verbose == true) {
				normalizedHardwareInfo.verbose = ret;
			}
			input.onDone(normalizedHardwareInfo);
		},
		"onError": input.onError
	}
	this.dvr_connector.info(get_info); // onDone, onError
}


// todo: 可以有精簡模式(model,serial number) 及 全部詳細模式 
deeplet.prototype.getDeviceInformation = function (input) {
	var normalizedHardwareInfo = {};
	var local_obj= {};

	var get_info = {};
	
	get_info.onDone = function (ret) {
		normalizedHardwareInfo = {
			"Model" : ret.Model,
			"Serial" : ret.Serial,
			"Version" : ret.SWVersion,
			"Screens": ret.Screens,
		};
		if (input.verbose == true) {
			normalizedHardwareInfo.verbose = ret;
		}
		input.onDone(normalizedHardwareInfo);
	}
	get_info.onError = input.onError;
	this.dvr_connector.info(get_info);
}

// FIXME get what?
deeplet.prototype.get = function (input) {
	LOG.warn(input);
}

// FIXME
deeplet.prototype.getAddmemInfo = function (input) {
	this.dvr_connector.get_addmem_info(input);
}

// FIXME
deeplet.prototype.getHddFullInfo = function (input) {
	this.dvr_connector.get_mem_info_hddfull(this.data);
}

// FIXME
deeplet.prototype.getAlarmHddInfo = function (input) {
	this.dvr_connector.get_mem_info_alarmhdd(this.data);
}

// FIXME
deeplet.prototype.getAuxFtpInfo = function (input) {
	this.dvr_connector.get_mem_info_aux_ftp(input);
}

// FIXME
deeplet.prototype.getAuxSerialsInfo = function (input) {
	this.dvr_connector.get_mem_info_aux_serials(input);
}

// FIXME
deeplet.prototype.getAuxMailInfo = function (input) {
	this.dvr_connector.get_mem_info_aux_mail(input);
}

// FIXME
deeplet.prototype.getMotionAttr = function (input) {
	this.dvr_connector.get_mem_info_motionattr(input);
}

deeplet.prototype.connectStream = function (input) {
	// check onData exists
	if (typeof(input.onData) == "undefined") {
		console.log("wrapper: input.onData undefined");
		input.onError("input.onData undefined");
		return;
	} else {
		this.data.onData = input.onData;
	}

	// check dataport exists
	if (typeof(this.data.dataport) === "undefined" && typeof(input.dataport) === "undefined") {
		console.log("wrapper connectStream: dataport " + this.data.dataport);
		input.onError("wrapper connectStream: dataport " + this.data.dataport);
	//	return; // FIXME
	}

	if (typeof(this.data.dataport) == "undefined" && typeof(input.dataport) != "undefined") {
		LOG.warn("using dataport: " + input.dataport);
		this.data.dataport = input.dataport;
	}
	
	LOG.warn('strm-dvr');
	LOG.warn(this.data);

	// 一定要連 dataport 50068
	this.dvr_connector.strm(this.data);
}


deeplet.prototype.disconnectStream = function (input) {
	this.dvr_connector.strm_disconn(input);
}


// 會導致整個 nodejs 跳出來
deeplet.prototype.exit = function (input) {
	this.dvr_connector.exit(input);
}

/*
deeplet.prototype.l_ctrlPTZ = function (ptz_obj) {
	var ptz_ctrl = setInterval (function () {
		if (ptz_obj.keyState) {
			this.dvr_connector.ptz(ptz_obj);
			ptz_obj.keyState = 0;
		} else {
			this.dvr_connector.ptz(ptz_obj);
			clearInterval(ptz_ctrl);
		}
	}, 200);
}
*/

/*
var l_ctrlPTZ_raw = function (ptz_obj) {
	var ptz_ctrl = this.dvr_connector.ptz(ptz_obj);
}
*/

// HSIAO SUI PU
deeplet.prototype.l_ctrlPTZ_hsp = function (targetA, targetB) {
	var self = this;

	var awake_b = function () {
		console.log("awake b");
		var b = setInterval (function () {
			if (targetB.keyState) {
				self.dvr_connector.ptz(targetB);
				targetB.keyState = 0;
			} else {
				self.dvr_connector.ptz(targetB);
				clearInterval(b);
				console.log("clear b");
			}
		}, 50);
	}

	console.log("awake a");
	var a = setInterval (function () {
		if (targetA.keyState) {
			self.dvr_connector.ptz(targetA);
			targetA.keyState = 0;
		} else {
			self.dvr_connector.ptz(targetA);
			clearInterval(a);
			console.log("clear a");
			awake_b();
		}
	}, 50);
}

deeplet.prototype.gogo_power_ranger = function (ptz_obj, hsp) {
	var self = this;
	this.tmpdata = {};
	this.tmpdata.ptz_obj = ptz_obj;
	this.tmpdata.hsp = hsp;

	if (typeof(this.gogo_power) !== "undefined") {
		return;
	}
	this.gogo_power = setInterval(function () {
		console.log("go go power ranger");
		console.log(self.tmpdata.ptz_obj.keyState);
		self.tmpdata.ptz_obj.keyState = 1;
		self.tmpdata.hsp.keyState = 1;
		self.l_ctrlPTZ_hsp(self.tmpdata.ptz_obj, self.tmpdata.hsp);
	}, 100);
}

deeplet.prototype.l_ctrlPTZ_raw = function (ptz_obj) {
	var ptz_ctrl = this.dvr_connector.ptz(ptz_obj);
}

deeplet.prototype.controlPTZ = function (input) {
	var self = this;
	var ptz_obj = {
		"keyState": input.keyState,
		"keyCode": 0,
		"ch": input.ch,
		"param": 0,
		"onDone": input.onDone,
		"onError": input.onError
	};

	var onDone = function (response) {
	};

	var onError = function (response) {
	};

/*
	var l_ctrlPTZ_raw = function (ptz_obj) {
		var ptz_ctrl = self.dvr_connector.ptz(ptz_obj);
	}
*/

	var up = {
		"keyState": input.keyState,
		"keyCode": 0,
		"ch": input.ch,
		"param": 0,
		"onDone": onDone,
		"onError": onError
	};

	var down = {
		"keyState": input.keyState,
		"keyCode": 1,
		"ch": input.ch,
		"param": 0,
		"onDone": onDone,
		"onError": onError
	};

	switch (input.Operation) {
	case "up":
		ptz_obj.keyCode = 0;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "down":
		ptz_obj.keyCode = 1;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "left":
		ptz_obj.keyCode = 2;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "right":
		ptz_obj.keyCode = 3;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "right-up":
		ptz_obj.keyCode = 3;
		/*
		this.l_ctrlPTZ_raw(ptz_obj);
		this.l_ctrlPTZ_raw(up);
		*/
		console.log(ptz_obj.keyState);
		console.log("ptz_obj.keyState");
		/*var gogo_power_ranger = setInterval(function () {
			console.log("go go power ranger");
			if (ptz_obj.keyState) {
				self.l_ctrlPTZ_hsp(ptz_obj, up);
			} else {
				console.log(clearInterval);
				clearInterval(gogo_power_ranger);
			}
		}, 200);*/
		if (ptz_obj.keyState == 0) {
			clearInterval(this.gogo_power);
			break;
		}
		this.gogo_power_ranger(ptz_obj, up);
		break;

	case "right-down":
		ptz_obj.keyCode = 3;
		/*
		this.l_ctrlPTZ_raw(ptz_obj);
		this.l_ctrlPTZ_raw(down);
		*/
		/*
		var gogo_power_ranger = setInterval(function () {
			console.log("go go power ranger");
			if (ptz_obj.keyState) {
				self.l_ctrlPTZ_hsp(ptz_obj, down);
			} else {
				console.log(clearInterval);
				clearInterval(gogo_power_ranger);
			}
		}, 200);
		*/
		if (ptz_obj.keyState == 0) {
			clearInterval(this.gogo_power);
			break;
		}
		this.gogo_power_ranger(ptz_obj, down);
		break;

	case "left-up":
		ptz_obj.keyCode = 2;
		/*
		this.l_ctrlPTZ_raw(ptz_obj);
		this.l_ctrlPTZ_raw(up);
		*/
		/*var gogo_power_ranger = setInterval(function () {
			console.log("go go power ranger");
			if (ptz_obj.keyState === 1) {
				self.l_ctrlPTZ_hsp(ptz_obj, up);
			} else {
				console.log(clearInterval);
				clearInterval(gogo_power_ranger);
			}
		}, 200);
\		*/
		if (ptz_obj.keyState == 0) {
			clearInterval(this.gogo_power);
			break;
		}
		this.gogo_power_ranger(ptz_obj, up);
		break;

	case "left-down":
		ptz_obj.keyCode = 2;
		/*
		this.l_ctrlPTZ_raw(ptz_obj);
		this.l_ctrlPTZ_raw(down);
		*/
		/*
		var gogo_power_ranger = setInterval(function () {
			console.log("go go power ranger");
			if (ptz_obj.keyState) {
				self.l_ctrlPTZ_hsp(ptz_obj, down);
			} else {
				console.log(clearInterval);
				clearInterval(gogo_power_ranger);
			}
		}, 200);
		*/
		if (ptz_obj.keyState == 0) {
			clearInterval(this.gogo_power);
			break;
		}
		this.gogo_power_ranger(ptz_obj, down);
		break;

	case "zoomin":
		ptz_obj.keyCode = 4;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "zoomout":
		ptz_obj.keyCode = 5;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "focus+":
		ptz_obj.keyCode = 6;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "focus-":
		ptz_obj.keyCode = 7;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "focusauto":
		ptz_obj.keyCode = 8;
		ptz_obj.keyState = 1;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "iris+":
		ptz_obj.keyCode = 9;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "iris-":
		ptz_obj.keyCode = 10;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "irisauto":
		ptz_obj.keyCode = 11;
		ptz_obj.keyState = 1;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "gotopreset":
		ptz_obj.keyCode = 12;
		ptz_obj.keyState = 1;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "setpreset":
		ptz_obj.keyCode = 13;
		ptz_obj.keyState = 1;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "seq":
		ptz_obj.keyCode = 19;
		ptz_obj.keyState = 1;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "seqon":
		ptz_obj.keyCode = 20;
		ptz_obj.keyState = 1;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "seqoff":
		ptz_obj.keyCode = 21;
		ptz_obj.keyState = 1;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "speed+":
		ptz_obj.keyCode = 22;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	case "speed-":
		ptz_obj.keyCode = 23;
		ptz_obj.param = input.param;
		this.l_ctrlPTZ_raw(ptz_obj);
		break;

	default:
		input.onError("incorrect operation");
		return;
	}
}

// executable
deeplet.prototype.getAuthenticationInfo = function (input) {
	this.dvr_connector.get_mem_info_auth(input);
}

// FIXME
deeplet.prototype.getNetworkInfo = function (input) {
	var net_info = input;
	net_info.onDone = function (ret) {
		LOG.warn("wrapper-getNetworkInfo-CB-dvr");
		var output = {
			"ip" : ret.sip.ip,
			"mask" : ret.sip.mask,
			"gateway" : ret.sip.router,
			"DNS" : ret.sip.DNS,
		};
		//this.data.networkInfo = ret;
		input.onDone(output);
	}
	this.dvr_connector.get_mem_info_net(local_obj);
}


// FIXME
deeplet.prototype.getHostname = function (input) {
	notSupport(input);
}

// FIXME
deeplet.prototype.setHostname = function (input) {
	notSupport(input);
}

// FIXME
deeplet.prototype.setSystemDateAndTime = function (input) {
	if (input.DateTimeType == "NTP") {
		this.data.onDone = function (response) {
			var update = function (after_set) {
				var update_orz = function (QAQ) {
					this.dvr_connector.update_mem_info({"onDone": input.onDone, "onError": input.onError}); // 5
				}

				var set_ntp = {
					"onDone": update_orz,
					"onError": input.onError,
					"data": response.sys_data,
				}

				set_ntp.data.TimeSync.isEnable = 1;
				set_ntp.data.TimeSync.TSPType = 1;

				if (typeof(input.NTP) != "undefined") {
					disable_ntp.data.TimeSync.TSP = input.NTP;
				}
				else {
					disable_ntp.data.TimeSync.TSP = "tick.stdtime.gov.tw";
				}

				var active_ntp = function (active) {
					this.dvr_connector.set_mem_info_sys(set_ntp); // 4
				}

				this.dvr_connector.update_mem_info({"onDone": active_ntp, "onError": input.onError}); // 3
			}
			var disable_ntp = {
				"onDone": update,
				"onError": input.onError,
				"data": response.sys_data,
			};
			disable_ntp.data.TimeSync.isEnable = 0;
			disable_ntp.data.TimeSync.TSPType = 0;
			// set_ntp.data.TimeSync.TSP = "time.windows.com";
			// console.log("%j", set_ntp);
			this.dvr_connector.set_mem_info_sys(disable_ntp); // 2
		}
		this.dvr_connector.get_mem_info_sys(this.data); // 1

	} else if (input.DateTimeType == "Manual") {

		this.data.onDone = function (response) {
			var time_settings = {
				"onDone": input.onDone,
				"onError": input.onError,
				"data": response.my_tm,
			};
			var check = new moment({
				"year": time_settings.data.year,
				"month": time_settings.data.tm_mon,
				"day": time_settings.data.tm_day,
			});
			if (input.Second >= 0 && input.Second < 60) {
				time_settings.data.tm_sec = input.Second;
			} else {
				input.onError("second [0 - 59].");
				return;
			}
			if (input.Minute >=0 && input.Minute < 60) {
				time_settings.data.tm_min = input.Minute;
			} else {
				input.onError("minute [0 - 59].");
				return;
			}
			if (input.Hour >= 0 && input.Hour < 24) {
				time_settings.data.tm_hour = input.Hour;
			} else {
				input.onError("hour [0 - 23].");
				return;
			}

			if (input.Year >= 1900) {
				time_settings.data.tm_year = (input.Year - 1900);
				check.year(input.Year);
			} else {
				input.onError("year [must greater than 1900].");
				return;
			}
			if (input.Month > 0 && input.Month < 13) {
				time_settings.data.tm_mon = input.Month - 1;
				check.month(input.Month - 1); // moment use 0 - 11
			} else {
				input.onError("Month [1 - 12].");
				return;
			}
			console.log(check.endOf("month")._d.toString().split(" ")[2]);
			if (input.Day > 0 && input.Day <= check.endOf("month")._d.toString().split(" ")[2]) {
				console.log(check.date());
				time_settings.data.tm_mday = input.Day;
				check.date(input.Day);
			} else {
				input.onError("day [1 - " + check.endOf("month")._d.toString().split(" ")[2] + "] (Year: " + check.year() + ", Month: "+ (check.month() + 1) + ")");
				return;
			}
			time_settings.data.wday = check.day(); // sunday: 0, Saturday: 6
			time_settings.data.yday = check.dayOfYear();

			this.dvr_connector.set_sys_time(time_settings);
		}
		this.dvr_connector.get_sys_time(this.data);
	}
}

// FIXME
deeplet.prototype.getDNS = function (input) {
	var net_info = input;
	net_info.onDone = function(ret) {
		LOG.warn("wrapper-getNetworkInfo-CB-dvr");
		var output = {
			"DNS" : ret.sip.DNS
		};
		//this.data.networkInfo = ret;
		input.onDone(output);
	}
	this.dvr_connector.get_mem_info_net(net_info);
}

// FIXME
deeplet.prototype.getNTP = function (input) {
	this.dvr_connector.get_sys_time(this.data);
}

// FIXME
deeplet.prototype.getNetworkDefaultGateway = function (input) {
	var net_info = input;
	net_info.onDone = function(ret) {
		LOG.warn("wrapper-getNetworkInfo-CB-dvr");
		var output = {
			"gateway" : ret.sip.router
		};
		//this.data.networkInfo = ret;
		input.onDone(output);
	}
	this.dvr_connector.get_mem_info_net(net_info);
}

// executable
deeplet.prototype.getSystemDateAndTime = function (input) {
	this.dvr_connector.get_sys_time(input);
}

// executable
deeplet.prototype.getSystemLog = function (input) {
	notSupport(input);
}

// FIXME
deeplet.prototype.getSystemInfo = function (input) {
	this.dvr_connector.get_mem_info_sys(input);
}

// executable
deeplet.prototype.getCamerasInfo = function (input) {
// FIXME
	this.dvr_connector.get_mem_info_cameras(input);
}

// FIXME
deeplet.prototype.getMotionInfo = function (input) {
	this.dvr_connector.get_mem_info_motion(input);
}

// FIXME
deeplet.prototype.getVideoLossInfo = function (input) {
	this.dvr_connector.get_mem_info_vloss(input);
}

// FIXME
deeplet.prototype.getAlarmInfo = function (input) {
	this.dvr_connector.get_mem_info_alarm(input);
}

// FIXME
deeplet.prototype.SETMEMINFO_MOTION = function (input) {
	var input2 = {
		"onDone": function (ack) {
			input.onDone("SETMEMINFO_MOTION_EVENT_RESPONSE", ack);
		},
		"data" : {"ActionData":[
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":0,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":1,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":2,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":3,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":4,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":5,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":6,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":7,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":8,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":9,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":10,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":11,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":12,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":13,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":14,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":15,"GoToPreset":255,"PreRecord":5,"PostRecord":10}
		]}
	}
	this.dvr_connector.set_mem_info_motion(input2);
}

// FIXME
deeplet.prototype.SETMEMINFO_VLOSS = function (input) {
	var obj2 = {
		"onDone": function (ack) {
			input.onDone("SETMEMINFO_VLOSS_EVENT_RESPONSE", ack);
		},
		"data" : {"ActionData":[
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":0,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":1,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":2,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":3,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":4,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":5,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":6,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":7,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":8,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":9,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":10,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":11,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":12,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":13,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":14,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":15,"GoToPreset":255,"PreRecord":5,"PostRecord":10}
		]}
	}
	this.dvr_connector.set_mem_info_vloss(obj2);
}

// FIXME
deeplet.prototype.SETMEMINFO_ALARM = function (input) {
	var obj2 = {
		"onDone": function (ack) {
			input.onDone("SETMEMINFO_ALARM_EVENT_RESPONSE", ack);
		},
		"data" : {"ActionData": [
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":0,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":1,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":2,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":3,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":4,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":5,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":6,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":7,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":8,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":9,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":10,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":11,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":12,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":13,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":14,"GoToPreset":255,"PreRecord":5,"PostRecord":10},
			{"Duration":10,"Log":1,"Buzzer":0,"Mail":0,"FtpOut":0,"NetAlarm":0,"ScrnMsg":1,"Resolved":[0,0],"AlarmOut":255,"FocusCh":15,"GoToPreset":255,"PreRecord":5,"PostRecord":10}]
		}
	}
	this.dvr_connector.set_mem_info_alarm(obj2);
}

// FIXME
deeplet.prototype.SETMEMINFO_SYS = function (input) {
	var obj2 = {
		"onDone": function (ack) {
			input.onDone("SETMEMINFO_SYS_EVENT_RESPONSE", ack);
		},
		"data" : {
			"TimeSync": {
				"isEnable":0,
				"TSPType":0,
				"TSP":"time.windows.com"
			},
			"TimeZone": {
				"index":50,
				"offset_hour":8,
				"offset_min":0,
				"isDSTEnable":"Not",
				"DST": {
					"s_month":0,
					"s_day":0,
					"s_hour":0,
					"e_month":0,
					"e_day":0,
					"e_hour":0
				},
				"DateTimeFormat":0
			},
			"language":0,
			"protectionKey":[49,48,48,48,0,49,48,48,49,0,49,48,48,50,0,49,48,48,51,0]
		}
	};
	this.dvr_connector.set_mem_info_sys(obj2);
}

// FIXME
deeplet.prototype.SETMEMINFO = function (input) {
	var obj2 = {
		"onDone": function (ack) {
			input.onDone("SETMEMINFO_EVENT_RESPONSE", ack);
		},
		"id": 0,
		"data" : 123
	};
	this.dvr_connector.set_mem_info(obj2);
}


// executable
// never used by API, wrapper should call update_mem_info() after modified
deeplet.prototype.UPDATEMEMINFO = function (input) {
	this.dvr_connector.update_mem_info(input);
}



deeplet.prototype.MotionDetectionSettings = function (input) {
	var orig_obj = {
		"onDone": function (ack) {
			var set = ack.MotionAttrs;
			set.ch[input.ch].Sensitivity = input.Sensitivity;
			set.ch[input.ch].GridCnts = input.GridCnts;
//				console.log(set.rows);
			/**
			 * bitmap to WinRow
			 */
//				console.log("bitmap to WinRow");
//				console.log(JSON.stringify(input));
//				console.log(JSON.stringify(ack));
			var mask = 0, WinRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

			mask = 0xFFFFFFFF - Math.pow(2, (set.cols)) + 1;
/*				for (var i = set.cols; i < 32; i++) {
				mask = mask + (1 << i);
				console.log(i + " " + set.cols + " " + JSON.stringify(mask));
			}
*/
//				console.log(mask);
			for (var i = 0; i < set.rows; i++) {
				for (var j = 0; j < set.cols; j++) {
					WinRow[i] += (input.map[i][j] << j);
//						console.log(WinRow[i]);
				}
				WinRow[i] += mask;
//					console.log(i + ": " + WinRow[i]);
			}

			for (var i = set.rows; i < 24; i++) {
				WinRow[i] = 0xFFFFFFFF;
			}

			set.ch[input.ch].WinRow = WinRow;
//				console.log(JSON.stringify(set.ch[input.ch].WinRow));
//				console.log(JSON.stringify(set.ch[0]));
			var setting_obj = {
				"onDone": input.onDone,
				"onError": input.onError,
				"data": set
			};
//				console.log(setting_obj);
			this.dvr_connector.set_mem_info_motionattrs(setting_obj);
		},
		"onError": input.onError,
	};

	console.log("get mattrs");
	this.dvr_connector.get_mem_info_motionattrs(orig_obj);
}


deeplet.prototype.PrivacyMaskSettings = function (input) {
	var PMask = {
		"numOfMasks": input.Masks.length,
		"color": 1,
		"x": [],
		"y": [],
		"width": [],
		"height": []
	};
	for (var i = 0; i < PMask.numOfMasks; i++) {
		PMask.x[i] = input.Masks[i].x;
		PMask.y[i] = input.Masks[i].y;
		PMask.width[i] = input.Masks[i].width;
		PMask.height[i] = input.Masks[i].height;
	}
//	console.log(input.Masks.length);
	var update = function (QAQ) {
		this.dvr_connector.update_addmem_info({"onDone": input.onDone, "onError": input.onError}); // 5
	}
	var orig_obj = {
		"key": "CamsAttrEx",
		"onDone": function (ack) {
			console.log(PMask);
			var setPMask = {
				"onDone": update,
				"onError": input.onError,
				"data": {
					"version": 0,
					"PMask": [],
					"reserved": [],
				}
			};
			ack.VtAddShareMemsAccess.VtAddShareMem.data.PMask[input.ch] = PMask;
			setPMask.data.PMask = ack.VtAddShareMemsAccess.VtAddShareMem.data.PMask;
			this.dvr_connector.set_addmem_info_camex(setPMask);
		},
		"onError": input.onError,
	}
	this.dvr_connector.get_addmem_info(orig_obj);
}

deeplet.prototype.updateaddmeminfo = function (input) {
	this.dvr_connector.update_addmem_info(input);
}

deeplet.prototype.onvifOperation = function (input) {
	notSupport(input);
}

// 回傳 network settings: executable
deeplet.prototype.network = function (input) {
	notSupport(input);
}

deeplet.prototype.probeOnvif = function (input) {
	notSupport(input);
}

deeplet.prototype.startRecording = function (input){
	notSupport(input);
}

deeplet.prototype.stopRecording = function (input){
	notSupport(input);
}

deeplet.prototype.getRecordingStatus = function (input){
	notSupport(input);
}

deeplet.prototype.getStreamUri = function (input) { 
	notSupport(input);
}

deeplet.prototype.getImagingSettings = function (input) {
	notSupport(input);
}

deeplet.prototype.brightness = function (input) {
	notSupport(input);
}


deeplet.prototype.colorSaturation = function (input) {
	notSupport(input);
}

deeplet.prototype.contrast = function (input) {
	notSupport(input);
}

deeplet.prototype.sharpness = function (input) {
	notSupport(input);
}


//回傳這個設備可用的功能 (new wrapper 和 init 不列入 ) 
deeplet.prototype.getAvailableFunctions = function (input) { 
	var availableFunctions = ['getAvailableFunctions', 'getWrapperStatus', 'getHardwareInfo', 'getAuthenticationInfo', 'getNetworkInfo', 'getSystemInfo', 'getCamerasInfo', 'getMotionInfo', 'getVideoLossInfo', 'getAlarmInfo', 'getHddFullInfo', 'getAlarmHddInfo', 'getAuxSerialsInfo', 'getAuxFtpInfo', 'getAuxMailInfo', 'getMotionAttr', 'getDNS' ]; 
	input.onDone( { 'availableFunctions': availableFunctions } );
	//偵測目前機器型號 
}

deeplet.prototype.probe = function(input) {
	notSupport(input);
}

module.exports = deeplet;
