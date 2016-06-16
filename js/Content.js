
(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/Content.html", {
        ready: function (element, options) {
            WinJS.Application.addEventListener("settingsChanged", this.onApplicationSettingsChanged);            
            setTimeout(refreshGrid.bind(), 500);

            // The resize event is raised when the view enters or exits full screen mode. 
            window.addEventListener("resize", onResize); 

        },
        unload: function () {
        	WinJS.Application.removeEventListener("settingsChanged", this.onApplicationSettingsChanged);        	
        },
        onApplicationSettingsChanged: function (e) {
        	createGridView();
        }
    });

    var grid = null;
    var theScreenSaver = null;

    function onResize() {
        alignScreenSaver();
    }

    function refreshGrid() {

        // Initialize screensaver 
        if(MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl) {
    		if (!theScreenSaver) {
					theScreenSaver = WinJS.Utilities.query("#screenSaver")[0];
                	theScreenSaver.setAttribute("src", MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl);
                	theScreenSaver.addEventListener("error", ScreenSaverPlayBackError);
                	theScreenSaver.addEventListener("suspend", ScreenSaverPlayBackError);
                	alignScreenSaver();
                	} else {
                	    // screensawer displayed
    			if (theScreenSaver.style.display != "none") {
    				alignScreenSaver();
                	}
                	}


    	if (MtcScheduleBoard.Data.Settings.WebServiceUrl) {
    		if (!grid) {
    			createGridView();
    		} 
    		refreshScheduleGrid();
    	}

    	}


    	setTimeout(refreshGrid.bind(), 1 * 60 * 1000); //refresh schedule each min
    }

    function createGridView() {
            
    	var filters = null;
    	if (MtcScheduleBoard.Data.ShowLocationColumn())
    		bindMultipleRoomGridView();
    	else
    		bindSingleRoomGridView();
    	/*if (MtcScheduleBoard.Data.Settings.Location && MtcScheduleBoard.Data.Settings.Location.length > 0) {
    		filters = MtcScheduleBoard.Data.Settings.Location.split(';');
    	}
    		if (filters && filters.length == 1) {
    			bindSingleRoomGridView();
    		} else {
    			bindMultipleRoomGridView(filters);
    		}
    	 */       
        refreshScheduleGrid();
    }

    /* Create and Bind grid for multiple room display mode*/
    function bindMultipleRoomGridView() {
    	
        // define grid
         grid = new Telerik.UI.RadGrid(document.getElementById("scheduleGrid"), {
            	dataSource: MtcScheduleBoard.Data.CalendarDataSource,
                // height: 500,
                columns: [                     
                    {
                    	title: 'Time', width: MtcScheduleBoard.Data.Settings.TitleColumnWidth,
                        template: '#=Telerik.Utilities.toString(StartTime, "HH:mm")# - #=Telerik.Utilities.toString(EndTime, "HH:mm")#',
                        attributes: {
                        	style: 'font-size: ' + MtcScheduleBoard.Data.Settings.TableFontSize + 'pt;'
                        },
                    },
                    {
                        field: 'Title', title: 'Engagement',
                        template: "#=MtcScheduleBoard.Data.FormatEngagementTitle(Title, MeetingExternalLink)#",
                        attributes: {
                        	style: 'font-size: ' + MtcScheduleBoard.Data.Settings.TableFontSize + 'pt;'
                        },
                    },
                    {
                    	title: "Location", width: MtcScheduleBoard.Data.Settings.LocationColumnWidth,
                        template: '#=MtcScheduleBoard.Data.MapRoom(Location)#',
                        attributes: {
                        	style: 'font-size: ' + MtcScheduleBoard.Data.Settings.TableFontSize + 'pt;'
                        },
                    }
                ],
            });

			grid.dataSource.sort = [{ field: "StartTime", dir: "asc" }];

			var filters = MtcScheduleBoard.Data.LocationFilters();
			if (filters) {
				grid.dataSource.filter = { logic: "or", filters: [{}] };

				//Add all rooms as filter creteria
				for (var i = 0, len = filters.length; i < len; i++) {
					grid.dataSource.filter.filters.push({ field: "Location", operator: "Contains", value: filters[i] });
				}

			}
    }

    function ScreenSaverPlayBackError(error) {
    	var errTitle = "PlayBackError: " + error.target.error.code;

    	switch (error.target.error.code) {
    		case error.target.error.MEDIA_ERR_ABORTED:
    			MtcScheduleBoard.ToastHelper.AddMessageToast(errTitle, "You aborted the video playback.");
    			break;
    		case error.target.error.MEDIA_ERR_NETWORK:
    			MtcScheduleBoard.ToastHelper.AddMessageToast(errTitle, "A network error caused the video download to fail part-way.");
    			break;
    		case error.target.error.MEDIA_ERR_DECODE:
    			MtcScheduleBoard.ToastHelper.AddMessageToast(errTitle,
					"The video playback was aborted due to a corruption problem or because the video used features your browser did not support.");
    			break;
    		case error.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
    			MtcScheduleBoard.ToastHelper.AddMessageToast(errTitle,
					"The video could not be loaded, either because the server or network failed or because the format is not supported.");
    			break;
    		default:    			
    			MtcScheduleBoard.ToastHelper.AddMessageToast(errTitle, "An unknown error occurred.");
    			break;
    	}
    	var theScreenSaver = WinJS.Utilities.query("#screenSaver")[0];
    	theScreenSaver.pause();
    	theScreenSaver.setAttribute("src", MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl);
    	theScreenSaver.play();

    }

    /* Create and Bind grid for single room display mode*/
    function bindSingleRoomGridView(){
    	grid = new Telerik.UI.RadGrid(document.getElementById("scheduleGrid"), {
    		dataSource: MtcScheduleBoard.Data.CalendarDataSource,
            // height: 500,
            columns: [                     
                 {
                 	title: 'Time', width: MtcScheduleBoard.Data.Settings.TitleColumnWidth,
                 	template: '#=Telerik.Utilities.toString(StartTime, "HH:mm")# - #=Telerik.Utilities.toString(EndTime, "HH:mm")#',
                 	attributes: {
                 		style: 'font-size: ' + MtcScheduleBoard.Data.Settings.TableFontSize + 'pt;'
                 	},
                 },
                {
                    field: 'Title', title: 'Engagement',
                    template: "#=MtcScheduleBoard.Data.FormatEngagementTitle(Title, MeetingExternalLink)#",
                    attributes: {
                    	style: 'font-size: ' + MtcScheduleBoard.Data.Settings.TableFontSize + 'pt;'
                    },
                }
            ],

    	});
    	grid.dataSource.sort = [{ field: "StartTime", dir: "asc" }];
        grid.dataSource.filter = { field: "Location", operator: "Contains", value: MtcScheduleBoard.Data.Settings.Location};
    }

    /* Position videoplayer at center of the screen*/
    function alignScreenSaver(){

        var applicationView = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();


        $('#screenSaver').height(function () {
            return applicationView.visibleBounds.height - $('#header').height() - $('#footer').height();
        });

        $('#screenSaver').css("margin-left", function (index) {
            var offsetLeft = (jQuery(window).width() - $('#screenSaver').width()) / 2;
            return offsetLeft;
        });
    }

    function refreshScheduleGrid() {
       
    	if (grid != null) {
    		grid.element.style.display = "block"; // If it's not visible - we can't update it
    		grid.dataSource.read();
    		grid.refresh();
    	}
        checkScreenSaver();
    }

    function checkScreenSaver() {

    	if (!theScreenSaver)
    		return;

        if (!theScreenSaver.src && MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl) { // check if source is set
			theScreenSaver.src = MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl;
        }

        if (grid && theScreenSaver && theScreenSaver.src) {
            var rows = grid.element.querySelectorAll(".k-grid-content tr:not(.k-header), .k-grid-content tr:not(.k-grouping-row)");
            if (rows && rows.length > 0) {
                // Show the grid            
            	grid.element.style.display = "block";
                theScreenSaver.style.display = "none";
                theScreenSaver.pause();                                
            } else {
            	//We don't have rows - show video
            	grid.element.style.display = "none";
                theScreenSaver.style.display = "block";
                theScreenSaver.play();
            }
        }
    }
})();