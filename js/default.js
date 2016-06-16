// For an introduction to the Fixed Layout template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232508

var MtcScheduleBoard = MtcScheduleBoard || {}; // Define global namespace

(function () {
   // "use strict";
var promises = [];
    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var promises = [];

	 app.addEventListener("error", function (err) {
        //var md = Windows.UI.Popups.MessageDialog;
        //var msg = new md(err.detail.exception, err.detail.error.errorThrown);
	 	//msg.showAsync();		
        MtcScheduleBoard.ToastHelper.AddMessageToast("Error", err.detail.exception);

        return true; // only if error is handled
    });

	 app.onloaded = function (args) {
	 	WinJS.Application.addEventListener("settingsChanged", onApplicationSettingsChanged);
	 	onApplicationSettingsChanged();
	 

	 };
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            
            args.setPromise(WinJS.UI.processAll());

            WinJS.Application.onsettings = function (e) {
            	e.detail.applicationcommands = {
            		"SetConnection": { title: "Connection", href: "/html/SettingsFlyout-Connection.html" },
					"SetDesign": { title: "Design", href: "/html/SettingsFlyout-Design.html" }
            	};            	
                WinJS.UI.SettingsFlyout.populateSettings(e);
            };

            WinJS.Application.start();
        }

        if (args.detail.previousExecutionState === activation.ApplicationExecutionState.running) {
        	var launch = JSON.parse(args.detail.arguments);
        	if (launch.reason) {
        		if (launch.reason == "Toast") {
        			// Error message - open settings 
        			Windows.UI.ApplicationSettings.SettingsPane.show();
        		}
        	}

        }

      //  setTimeout(restoreLayout.bind(), 2000);
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
  

    function trackPromise(p) { promises.push(p); }
    function untrackPromise(p) { promises.slice(promises.indexOf(p), 1); }

    function processCSS(request) {
    
        if (request.status !== 200) {           
            return;
        }

        var cssText = request.responseText;
        if (!cssText)
            return;
        var css = document.createElement("style");
        css.type = "text/css";
        if ("textContent" in css)
            css.textContent = cssText;
        else
            css.innerText = cssText;
        document.head.appendChild(css);
      
    }
    
     function onApplicationSettingsChanged() {
    	if (MtcScheduleBoard.Data.Settings.BackgroundColor) {
    		$("#header").css("background-color", MtcScheduleBoard.Data.Settings.BackgroundColor);
    		$("#footer").css("background-color", MtcScheduleBoard.Data.Settings.BackgroundColor);
    		$("#MtcLogo").css("background-color", MtcScheduleBoard.Data.Settings.BackgroundColor);
    	}
    	if (MtcScheduleBoard.Data.Settings.HideFooterDisplayMode) {
    		// Todo hide footer control and show different header control
    		$("#footer").remove();
    	}

         //Apply Css settings
    	if (MtcScheduleBoard.Data.Settings.Css) {
            // load custom CSS definition from the server
    var promise = WinJS.xhr({ url: MtcScheduleBoard.Data.Settings.Css,headers: {"If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"}});
    	    trackPromise(promise);
    	    promise.then(processCSS.bind(), cssDownloadError.bind()).done(function () { untrackPromise(promise);})
    	   
    	}
    	    	
    };

})();
 
function cssDownloadError(err) {
    // Create the message dialog and set its content
    var messageDialog = new Windows.UI.Popups.MessageDialog("Http Error:" + err.status + " for " +  MtcScheduleBoard.Data.Settings.Css, "Can't download styles");
    // Show the message dialog
    messageDialog.showAsync();    
}

function HttpRequestError(err) {

	//Display toast notofocation with error information
	var errTitle = err.errorThrown;
	if (!errTitle && err.status)
		errTitle = err.status;

	var errDescription = err.status + ": "
							+ err.xhr.status + "; " + err.sender.transport.options.read.url;

	/*
	-- We don't need parse long response text
	if (!errDescription && err.xhr.responseText) {
		var temp = document.createElement('div');
		temp.innerHTML = err.xhr.responseText;
		errDescription = temp.innerText;
	}*/

	MtcScheduleBoard.ToastHelper.AddMessageToast(errTitle, errDescription);
	//err.xhr.responseText
}

  
