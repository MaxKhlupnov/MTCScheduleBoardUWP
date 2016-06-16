"use strict";

MtcScheduleBoard.Data = MtcScheduleBoard.Data || {  }; // Declare MtcScheduleBoard.Data.Settings namespace

MtcScheduleBoard.Data.Settings = {
	HttpServerUrl: "",
	WebServiceUrl: "", // http://mtc-moss-wfe1.technohow.ru:7777/ScheduleUpdate.ashx
	RoomDefinitionUrl: "", // http://mtc-moss-wfe1.technohow.ru:7777/rooms.xml
	Location: "", Title: "", Title_En: "", IconTop: "", IconBottom: "", Css: "",
	ScreenSaverVideoUrl: "", // http://mtc-moss-wfe1.technohow.ru:7777/DefaultScreenSaver.mp4
	HideFooterDisplayMode: false,
	TableFontSize: 22,
	TableFontFamily: "Segoe UI",
	HeaderFontSize: 44,
	HeaderFontFamily: "Segoe UI",
	ClockFontSize: 72,
	ClockFontFamily: "Segoe UI",
	BackgroundColor: "#21bdee",
	TitleColumnWidth: 250,
	LocationColumnWidth: 400,		
}; //Declare MtcScheduleBoard.Data.Settings namespace

MtcScheduleBoard.Data.LocationFilters = function () {
	if (MtcScheduleBoard.Data.Settings.Location && MtcScheduleBoard.Data.Settings.Location.length > 0) {
		return MtcScheduleBoard.Data.Settings.Location.split(';');
	} else {
		return new Array();
	}
};

MtcScheduleBoard.Data.ShowLocationColumn = function () {
	return MtcScheduleBoard.Data.LocationFilters().length > 1;
};


MtcScheduleBoard.Data.Appointments = [{StartTime: null,EndTime: null, Title: "", Location : "", Category: "", MeetingExternalLink: ""}];


MtcScheduleBoard.Data.Rooms = [];//{ Location: "", Title: "", Title_En: "", IconTop: "", IconBottom: "", Css: "" }

MtcScheduleBoard.Data.CalendarDataSource = null;
MtcScheduleBoard.Data.RoomDefinitionDataSource = null;

// Compile template for roomTitle column
$.template("roomTitleTmpl", "${Title} ${Title_En};&nbsp;");


MtcScheduleBoard.Data.FormatEngagementTitle = (function (Title, MeetingExternalLink) {
    
    if (!MeetingExternalLink)
        return Title;
    else
        return "<a href='" + MeetingExternalLink + "'>" + Title + "</a>";
});


MtcScheduleBoard.Data.MapRoom = (function (RoomId) {
    // Remove all email adressess
    var re = new RegExp("([^.@\\s]+)(\\.[^.@\\s]+)*@([^.@\\s]+\\.)+([^.@\\s]+)");
    RoomId = RoomId.replace(re, "").trim();

    var arRooms = RoomId.split(";"); // Engagement can be scaduled for multiple rooms
    if (arRooms.length == 0) 
        return RoomId; //Nothing to show
    var RoomMatched = new Array();

    for (var i = 0, len = arRooms.length; i < len; i++) {
        var room = arRooms[i].trim();
        var roomTitle = $.grep(MtcScheduleBoard.Data.Rooms, function (e) {
            return e.Location == room;
        });
        if (roomTitle.length > 0)
            RoomMatched.push(roomTitle[0]);
    }

    if (RoomMatched.length == 0) {
        // not found
        return RoomId;
    } else {        
        var returnValue = $.tmpl('roomTitleTmpl', RoomMatched);
        //returnValue = $.tmpl('roomTitlesCellTmpl', returnValue);
        return returnValue[0].textContent;
        ;
        //RoomMatched[0].Title + " " + RoomMatched[0].Title_En;
    }


});

(function () {    
    
    var _settings = Windows.Storage.ApplicationData.current.localSettings.values;
    if (_settings.hasKey("Settings")) {
    	MtcScheduleBoard.Data.Settings = JSON.parse(_settings.Settings);
    }

	// Load room definitions
     ConfigureRoomsDatasource();
     if (MtcScheduleBoard.Data.Settings.RoomDefinitionUrl) {
     	MtcScheduleBoard.Data.RoomDefinitionDataSource.read();     	
     }

     ConfigureApplicationStyles();

	// Configure web service datasource
     ConfigureCalendarDatasource();
	        
    MtcScheduleBoard.Data.setSettings = function () {
    	_settings.Settings = JSON.stringify(MtcScheduleBoard.Data.Settings);
    	WinJS.Application.queueEvent({ type: "settingsChanged", detail: { value: MtcScheduleBoard.Data.Settings } });
    };

})();


function ConfigureRoomsDatasource() {
	MtcScheduleBoard.Data.RoomDefinitionDataSource = new Telerik.Data.DataSource({
		transport: {
			read: {
				url: MtcScheduleBoard.Data.Settings.RoomDefinitionUrl,
				dataType: "xml",
				cache: false
			},
		},
		schema: {
			parse: parseRoomDefinitionResponse
		},
		onerror: HttpRequestError
	});	
}


function ConfigureCalendarDatasource() {
	MtcScheduleBoard.Data.CalendarDataSource = new Telerik.Data.DataSource({
		transport: {
			read: {
				url: MtcScheduleBoard.Data.Settings.WebServiceUrl,
				dataType: "xml",
				cache: false
			},
		},
		schema: {
			parse: parseCalendarResponse
		},
		sort: [
		  { field: "Title_En", dir: "asc" },
		  { field: "Title", dir: "asc" }
		],
	 	onerror: HttpRequestError
	 });
}


function parseRoomDefinitionResponse(response) {

    
	var items = response.querySelectorAll("Room");
    if (!items) {
        return; // TODO: error
    }
   
    var SelectedItemIndex = -1;

    for (var i = 0, len = items.length; i < len; i++) {
    	var item = items[i];

    	var ifExistArray = null;
		// Check if we have this item in the datasource
    	if (MtcScheduleBoard.Data.Rooms != null && MtcScheduleBoard.Data.Rooms.length > 0) {
    		ifExistArray = MtcScheduleBoard.Data.Rooms.filter(function (itemTemp) {
    			return (itemTemp.Location === item.attributes["Location"].textContent);
    		});
    	}
		// If this location is unique - add new item into datasource
    	if (ifExistArray == null || ifExistArray.length == 0)
			MtcScheduleBoard.Data.Rooms.push({
				Location: item.attributes["Location"].textContent,
				Title: item.querySelector("Title").textContent,
				Title_En: item.querySelector("Title_En").textContent,
				IconTop: item.querySelector("IconTop").textContent,
				IconBottom: item.querySelector("IconBottom").textContent,
				Css: item.querySelector("Css").textContent
			});        
    }
	
    return MtcScheduleBoard.Data.Rooms;

};

function parseCalendarResponse(response) {
	var items = response.querySelectorAll("Appointment");	

	if (!items) {
		return; // TODO: error
	}
	var parsedResponse = [];
	var item = null;
	for (var i = 0, len = items.length; i < len; i++) {
		var item = {
			StartTime: new Date(items[i].querySelector("StartTime").textContent),
			EndTime: new Date(items[i].querySelector("EndTime").textContent),
			Title: items[i].querySelector("Title").textContent,
			Location: items[i].querySelector("Location").textContent,
			Category: items[i].querySelector("Category").textContent,
			MeetingExternalLink: ""
		}

		var MeetingExternalLink = items[i].querySelector("MeetingExternalLink");
		if (MeetingExternalLink)
		    item.MeetingExternalLink = unescape(MeetingExternalLink.textContent);
		

		if (item.StartTime.getHours() < 5) // We change time for full day engagements to 9-18
			item.StartTime.setHours(9);
		if (item.EndTime.getHours() < 5) // We change time for full day engagements to 9-18
			item.EndTime.setHours(18);

		var HoursToEndFoEngeagement = item.EndTime.getHours() - new Date().getHours();

		if (HoursToEndFoEngeagement >= -1) // Engagement is actual and scheduled, we hold history for 1 hour
			parsedResponse.push(item);
	}

	return parsedResponse;
}

function ConfigureApplicationStyles() {

}

