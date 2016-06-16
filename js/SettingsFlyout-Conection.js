//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/SettingsFlyout-Connection.html", {
        ready: function (element, options) {
                    


            //restore controls state from settings
        	txtWebServiceUrl.value = MtcScheduleBoard.Data.Settings.HttpServerUrl;
        	txtWebServiceUrl.onchange = handleWebServiceUrlChange;
        	if (MtcScheduleBoard.Data.Settings.WebServiceUrl) {
        		
        		setHref("aWebServiceStatus", MtcScheduleBoard.Data.Settings.WebServiceUrl);
        		document.getElementById("txtCheckUrlLbl").style.display = "block";
        	}
			
        	btnReloadDefinition.addEventListener("click", this.onRoomFilterSelected);
			
        	// Disable cfilter selection combobix for now        	
        	this.bindRoomFilterSelect();
			// Set event handlers for room definition loader
        	MtcScheduleBoard.Data.RoomDefinitionDataSource.addEventListener("change", this.onRoomDatasourceChanged);
        	MtcScheduleBoard.Data.RoomDefinitionDataSource.addEventListener("error", this.onRoomDatasourceError);


        	if (MtcScheduleBoard.Data.Settings.RoomDefinitionUrl) {        		
        		setHref("aRoomDefinitionStatus", MtcScheduleBoard.Data.Settings.RoomDefinitionUrl);        		
        		MtcScheduleBoard.Data.RoomDefinitionDataSource.read();
        	}
			
        	if (MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl)
        		setHref("aScreenSaverStatus", MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl);
            
                       
        },
        unload: function () {

        	MtcScheduleBoard.Data.RoomDefinitionDataSource.removeEventListener("change", this.onRoomDatasourceChanged);
        	MtcScheduleBoard.Data.RoomDefinitionDataSource.removeEventListener("error", this.onRoomDatasourceError);
        	        	
        },     
        bindRoomFilterSelect: function () {
        	// Set inital status for Room filter combobox
        	var comboBox = document.getElementById("txtRoomFilter");
        	if (!comboBox)
        		return;
        	comboBox.addEventListener("change", this.onRoomFilterSelected)
        	//Combobox created and populated
        	if (comboBox.hasChildNodes && comboBox.childNodes.length > 0)
        		return;

        	comboBox.disabled = true;
        	var defaultOption = document.createElement("option");
        		defaultOption.text = "No filter defined";
        		defaultOption.value = "";
        		defaultOption.selected = true;
        		comboBox.add(defaultOption);

        	if (!MtcScheduleBoard.Data.Rooms)
        		return;
    
        },
        onRoomDatasourceError: function (e) {
        	if (MtcScheduleBoard.Data.Settings.RoomDefinitionUrl) {
        		displayMessage("Error download room configuration from " + MtcScheduleBoard.Data.Settings.RoomDefinitionUrl);
        		setHref("aWebServiceStatus", "");
        		setHref("aRoomDefinitionStatus", "");
        		setHref("aScreenSaverStatus", "");
        	}
        },
        onRoomDatasourceChanged: function (e) {

        	var comboBox = document.getElementById("txtRoomFilter");

			//Check if we have predefined filters
        	if (MtcScheduleBoard.Data.RoomDefinitionDataSource == null || MtcScheduleBoard.Data.RoomDefinitionDataSource.data == null)
        		return;

        	MtcScheduleBoard.Data.RoomDefinitionDataSource.data.forEach(function (value, i) {

				// Check if this is unique option and add int combobox
        		var ifExist = $(comboBox).filter('[value==' + value.Location + ']');
        	    if (ifExist == null || ifExist.length == 0) {
        	    	var newOption = document.createElement("option");
        	    	newOption.text = value.Title_En;
        	    	newOption.value = value.Location;
        	    	if (MtcScheduleBoard.Data.Settings.Location && MtcScheduleBoard.Data.Settings.Location == value.Location) {
        	    		// Room filter already specified
        	    		newOption.selected = true;
        	    	}
        	    	comboBox.add(newOption);
        	    }
        	});

        	if (MtcScheduleBoard.Data.RoomDefinitionDataSource.data.length  > 0) {
        		comboBox.disabled = false;
        	}        	
        },
        onRoomFilterSelected: function (e) {
        
        	var comboBox = e.srcElement;

        		//No selection made
        		if (!comboBox || comboBox.selectedIndex < 0)
        			return;

        		var selectedItem = comboBox[comboBox.selectedIndex];
        		if (!selectedItem) {
        		    displayMessage("No room selection made.");
        		    return;
        		}
                
        		//Try to find corresponding item in datasource array
        		var ifExistArray = MtcScheduleBoard.Data.RoomDefinitionDataSource.data.filter(function (itemTemp) {
        			return (itemTemp.Location === selectedItem.value);
        		});


        		//First item is always no filter
        		if (ifExistArray.length > 0) {
        			// Choosen from combobox
        			var item = ifExistArray[0];

        			MtcScheduleBoard.Data.Settings.Location = item.Location;
        			MtcScheduleBoard.Data.Settings.Title = item.Title;
        			MtcScheduleBoard.Data.Settings.Title_En = item.Title_En;
        			MtcScheduleBoard.Data.Settings.IconTop = item.IconTop;
        			MtcScheduleBoard.Data.Settings.IconBottom = item.IconBottom;
        			MtcScheduleBoard.Data.Settings.Css = item.Css;
        		} else {
        			//Filter removed
        			MtcScheduleBoard.Data.Settings.Location = "";
        			MtcScheduleBoard.Data.Settings.Title = "";
        			MtcScheduleBoard.Data.Settings.Title_En = "";
        			MtcScheduleBoard.Data.Settings.IconTop = "";
        			MtcScheduleBoard.Data.Settings.IconBottom = "";
        			MtcScheduleBoard.Data.Settings.Css = "";
        		}
                    
        		MtcScheduleBoard.Data.setSettings();

            // Create the message dialog and set its content
        		var messageDialog = new Windows.UI.Popups.MessageDialog("Please restart application to apply all new preferences", "Setings was changed");
            // Show the message dialog
        		messageDialog.showAsync();

        },
    });

    function handleWebServiceUrlChange(evt) {

    	// Ignore empty values
    	if (!evt.srcElement.value)
    		return;
    	var Url = evt.srcElement.value;
    	var re = new RegExp("((https?|http):\/\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#\/%=~_|]");

    	if (!re.test(Url)) {
    		displayMessage("Wrong URL format: " + Url);
    		return;
		}

    	MtcScheduleBoard.Data.Settings.HttpServerUrl = Url;

    	MtcScheduleBoard.Data.Settings.WebServiceUrl = Url + "/ScheduleUpdate.ashx";
    	ConfigureCalendarDatasource();
    	MtcScheduleBoard.Data.CalendarDataSource.read();

    	MtcScheduleBoard.Data.Settings.RoomDefinitionUrl = Url + "/rooms.xml";
    	ConfigureRoomsDatasource();
    	MtcScheduleBoard.Data.RoomDefinitionDataSource.read();

    	MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl = Url + "/DefaultScreenSaver.mp4";

    	setHref("aWebServiceStatus", MtcScheduleBoard.Data.Settings.WebServiceUrl);
    	setHref("aRoomDefinitionStatus", MtcScheduleBoard.Data.Settings.RoomDefinitionUrl);
    	setHref("aScreenSaverStatus", MtcScheduleBoard.Data.Settings.ScreenSaverVideoUrl);

    	MtcScheduleBoard.Data.setSettings();
    }

    function setHref(elmntId, Url) {
    	if (!Url)
    		return;

    	var Title;
    	switch (elmntId){
    		case "aWebServiceStatus":
    			Title = "Click to check service"
    			break;
    		case "aRoomDefinitionStatus":
    			Title = "Click to check room config"
    			break;
    		case "aScreenSaverStatus":
    			Title = "Click to check screensaver"
    			break;
    		default:
				Title = Url;
		}
    	var aElm = document.getElementById(elmntId);
    	aElm.innerText = Title;
    	aElm.href = Url;    	    	
    }

    function displayMessage(msgText) {
    	var msgDiv = document.getElementById("txtCheckUrlLbl");
    	if (!msgDiv)
    		return;
    	msgDiv.style.display = "block";
    	msgDiv.innerText = msgText;

	}

})();

