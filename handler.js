//
//  handler.js
//
//  main server logic
//

// a pool for all message handlers
var l_handlers = exports.handlers = {};
var l_checkers = exports.checkers = {};

var wrapper = require('../');

var person1;
var person2;

var w1 = null;
var w2;
var w3;


//var wrapper = require('./wrapper.js');

l_handlers.t = function (event) {

	// onDone
	var oD = function (out) {
		LOG.warn(out);
		event.done('onDone: ', { 'output': out }); 
	};

	// onNotify
	var oN = function (notify) {
		LOG.warn("onNotify ");
		console.log(notify);
	};
    
	// onError
	var oE = function (err) {
		LOG.warn("onError ");
		console.log(err);
		event.done( 'onError: ', { 'output': err } ); 
	};

	var onData = function (data) {
		LOG.warn("onData ");
//		console.log(data.data[0] + " " + data.encode);
	};

	LOG.warn(event);
	argv4 = event.data.argv4;

	switch (event.data.do) {

	case 'new1':
		if (!w1) {
			var obj = {
				"type": 'dvr',
				"device_type": 'deeplet',
				"model": '',
				"host": '163.22.32.59',
				"port": 50067,
				"dataport": 50068,
				"user": 'aa',
				"passwd": '11',
				"onNotify": oN,
				"onDone": oD,
				"onError": oE,
				"onData": onData
			};
			w1 = new wrapper(obj);
			// w1 = new wrapper();
			// w11 = new wrapper();
			// oD("new wrapper w1 and w2");
		// event.done('done: ', 'new a wrapper');
		} else {
			oD("Wrapper already inited");
		}
		break;

	case 'new2':
		w2 = new wrapper();
		break;
        
	case 'new3':
		var obj1 = {
			"type": 'onvif',
/*			"host": '140.109.221.238',
			"port": '8153',*/
			"host": '163.22.32.118',
			"port": '80',
			"user": 'root',
			"passwd": '9999',
			"onDone": oD,
			"onNotify": oN,
			"onError": oE,
		};
		 w3 = new wrapper(obj1);
		// event.done('done: ', 'new a wrapper');
		break;
        
	case 'init1': 
		var obj = {
			"type": 'deeplet',
			"device_type": 'deeplet',
			"model": '',
			"host": '163.22.32.59',
			"port": 50067,
			"dataport": 50068,
			"user": 'aa',
			"passwd": '11',
			"onNotify": oN,
			"onDone": oD,
			"onError": oE,
//			"onData": onData 
		};
		w1.INIT(obj);
		var obj2 = {
			"type": 'dvr',
			"model": '',
			"host": 'gkbahd.fly2dns.net',
			"port": 67,
			"dataport": 68,
			"user": 'aa',
			"passwd": '11',
			"onNotify": oN,
			"onDone": oD,
			"onError": oE,
		}
		w11.INIT(obj2);
		break;

	case 'init2':
		var obj1 = {
/*			"type": 'onvif',
			"host": '192.168.0.205',
			"port": '80',
			"user": '',
			"passwd": '',
			"onDone": oD,
			"onNotify": oN,
			"onError": oE,*/
			"type": 'onvif',
			"host": '140.109.221.238',
			"port": '8153',
			"user": 'root',
			"passwd": '9999',
			"onDone": oD,
			"onNotify": oN,
			"onError": oE,
		};
		w2 = new wrapper(obj1);
		w2.INIT(obj1);
		break;
        
        case 'init3':
		var obj2 = {
			"type": 'onvif',
/*			"host": '140.109.221.238',
			"port": '8153',*/
			"host": '163.22.32.118',
			"port": '80',
			"user": 'root',
			"passwd": '9999',
			"onDone": oD,
			"onNotify": oN,
			"onError": oE,
		};
		w3.INIT( obj2 );
		break;
        
	case 'probe':
		// w3.probe({"onDone": oD, "onNotify": oN, "onError": oE,}); 
		var obj = {"type": "onvifAutoscan","onDone": oD, "onError": oE,};
		w3 = new wrapper(obj);
		break;
        case 'getConnectorStatus1': 
		w1.getConnectorStatus({"onDone": oD, "onNotify": oN, "onError": oE,}); 
	        break;
        
        case 'getConnectorStatus2': 
		w2.getConnectorStatus({"onDone": oD, "onNotify": oN, "onError": oE,}); 
		break;

	case 'getStreamUri':
		w3.getStreamUri({"onDone": oD, "onNotify": oN, "onError": oE});
		break;
 
	case 'setHostname3': 
		w3.setHostname({"onDone": oD, "onNotify": oN, "onError": oE, "Hostname": "test"}); 
	        break;
        
        case 'setSystemDateAndTime':
		if (typeof(w1) != "undefined") {
			console.log("test");
			w1.setSystemDateAndTime({
				"onDone": oD, 
				"onNotify": oN,
				"onError": oE, 
				"DateTimeType": event.data.DateTimeType, // "NTP",
				"NTP": event.data.NTP,
				"DaylightSaving": "False",
				"Year": event.data.Year,
				"Month": event.data.Month,
				"Day": event.data.Day,
				"Hour": event.data.Hour,
				"Minute": event.data.Minute,
				"Second": event.data.Second,
			});
		}
		if (w3) {
			w3.setSystemDateAndTime({
				"onDone": oD, 
				"onNotify": oN,
				"onError": oE, 
				"DateTimeType": "Manual",
				"DaylightSaving": "False",
				"Year": "2014",
				"Month": "6",
				"Day": "1",
				"Hour": "9",
				"Minute": "10",
				"Second": "50"
			});
		}
                break;
        case 'getWrapperStatus1': 
            w1.getWrapperStatus({"onDone": oD, "onNotify": oN, "onError": oE,}); 
        break;
        
        case 'getWrapperStatus2': 
            w2.getWrapperStatus({"onDone": oD, "onNotify": oN, "onError": oE,}); 
        break;
        
        case 'getWrapperStatus3': 
            w3.getWrapperStatus({"onDone": oD, "onNotify": oN, "onError": oE,}); 
        break;
        
        case 'getHardwareInfo1': 
            w1.getHardwareInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getHardwareInfo2': 
            w2.getHardwareInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getHardwareInfo3': 
            w3.getHardwareInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'strm':
            w1.connectStream({"onDone": oD, "onNotify": oN, "onError": oE, "onData": onData});
        break;
        
	case 'strm-disconn':
		w1.disconnectStream({"onDone": oD, "onNotify": oN, "onError": oE,});
		break;
        
	case 'exit':
		w1.exit({"onDone": oD, "onNotify": oN, "onError": oE,});
		break;

	case 'controlPTZ':
		if (w1) {

			w1.controlPTZ({
				"onDone": oD,
				"onNotify": oN,
				"onError": oE,
				"Operation": event.data.Operation,
				"ch": 0, 
				"param": event.data.param,
				"keyState": event.data.keyState,
			});

		} else {
			oE("wrapper not init");
		}
		break;

	case "MotionDetectionSettings":
		w1.MotionDetectionSettings({
			"onDone": oD,
			"onNotify": oN,
			"onError": oE,
			"ch": 0,
			"Sensitivity": 3,
			"GridCnts": 4,
			"map": [
				[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			]
		});
		break;
        
        case 'getmeminfo-auth':
            w1.getAuthenticationInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getmeminfo-net':
            w1.getNetworkInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getmeminfo-sys':
            w1.getSystemInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getmeminfo-cameras':
            w1.getCamerasInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getmeminfo-motion':
            w1.getMotionInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getmeminfo-vloss':
            w1.getVideoLossInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getmeminfo-alarm':
            w1.getAlarmInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'setmeminfo-motion': 
            w1.SETMEMINFO_MOTION({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'setmeminfo-vloss': 
            w1.SETMEMINFO_VLOSS({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'setmeminfo-alarm': 
            w1.SETMEMINFO_ALARM({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'setmeminfo-sys': 
            w1.SETMEMINFO_SYS({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'setmeminfo': 
            w1.SETMEMINFO({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'updatememinfo':
            w1.UPDATEMEMINFO({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'network1':
            w1.getNetworkInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;
        
        case 'getNetworkInfo3':
            w3.getNetworkInfo({"onDone": oD, "onNotify": oN, "onError": oE,});
        break;

	case "PrivacyMaskSettings":
		w1.PrivacyMaskSettings({
			"onDone": oD,
			"onError": oE,
			"ch": 0,
			"Masks": [
				{"x": 0, "y": 0, "width": 2, "height": 2},
				{"x": 2, "y": 2, "width": 2, "height": 2},
				{"x": 4, "y": 4, "width": 2, "height": 2},
				{"x": 6, "y": 6, "width": 2, "height": 2},
				{"x": 8, "y": 8, "width": 2, "height": 2},
			],
			
		});
		break;

	case "updateaddmeminfo":
		w1.updateaddmeminfo({"onDone": oD, "onNotify": oN, "onError": oE,});
		break;

        case 'exec3': // 直接執行 onvifc
	        obj = {
	            operation : "GetImagingSettings",
	            onDone: oD,
	            onError: oE
	        }
	        w3.onvifOperation(obj);
        break;

	case "getImagingSettings":
		w3.getImagingSettings({"onDone": oD, "onError": oE});
		break;
	case "getSystemDateAndTime":
		if (w1 != null) {
			w1.getSystemDateAndTime({"onDone": oD, "onError": oE});
		}
		w3.getSystemDateAndTime({"onDone": oD, "onError": oE});
		break;
 
	case 'brightness':
		w3.brightness({"onDone": oD, "onError": oE, "value": 100.0});
		break;

	case 'colorSaturation':
		w3.colorSaturation({"onDone": oD, "onError": oE, "value": 200.0});
		break;
        
	case 'contrast':
		w3.contrast({"onDone": oD, "onError": oE, "value": 150.0});
		break;
        
	case 'sharpness':
		w3.sharpness({"onDone": oD, "onError": oE, "value": 200});
		break;

/*        
	case 'brightnessIncrease':
		onvifc_connector.brightness('192.168.0.205', 'increase');
		event.done('done: ', output);
		break;
	case 'brightnessDecrease':
		onvifc_connector.brightness('192.168.0.205', 'decrease');
		event.done('done: ', output);
		break;
	case 'brightness':
		onvifc_connector.brightness('192.168.0.205', oD );
		break;

	case 'colorSaturationIncrease':
		onvifc_connector.colorSaturation('192.168.0.205', 'increase');
		event.done('done: ', output);
		break;
	case 'colorSaturationDecrease':
		onvifc_connector.colorSaturation('192.168.0.205', 'decrease');
		event.done('done: ', output);
		break;
	case 'colorSaturation':
		onvifc_connector.colorSaturation('192.168.0.205', oD );
		break;
        
	case 'contrastIncrease':
		onvifc_connector.contrast('192.168.0.205', 'increase');
		event.done('done: ', output);
		break;
	case 'contrastDecrease':
		onvifc_connector.contrast('192.168.0.205', 'decrease');
		event.done('done: ', output);
		break;
	case 'contrast':
		onvifc_connector.contrast('192.168.0.205', oD );
		break;
        
	case 'sharpnessIncrease':
		onvifc_connector.sharpness('192.168.0.205', 'increase');
		event.done('done: ', output);
		break;
	case 'sharpnessDecrease':
		onvifc_connector.sharpness('192.168.0.205', 'decrease');
		event.done('done: ', output);
		break;
	case 'sharpness':
		onvifc_connector.sharpness('192.168.0.205', oD );
		break;
*/

	default:
    
        //如果只是要 ({"onDone": oD, "onNotify": oN, "onError": oE,}); 就可以直接用這裡 
		var cmd = event.data.do + "({\"onDone\": oD, \"onNotify\": oN, \"onError\": oE,});";
        
		LOG.warn(cmd);

		oE("command not found");
		// eval(cmd);
    
        //onvifc_connector.execute(event.data.do, '192.168.0.205', argv4, CB );
        //event.done( 'done: ', 't no do input-output' ); 
		break;
	}
}
