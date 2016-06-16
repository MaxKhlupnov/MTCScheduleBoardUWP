/*!
  To learn more about how to write your Action, see the following documentation:
  http://go.microsoft.com/fwlink/?LinkId=313673
*/
(function () {
	"use strict";

	var page = WinJS.UI.Pages.define("/html/Footer.html", {
		ready: function (element, options) {

			if (MtcScheduleBoard.Data.Settings.IconBottom)
				document.getElementById("footerLogo").src = MtcScheduleBoard.Data.Settings.IconBottom;

		},
	});

	WinJS.Namespace.define ("MtcScheduleBoard.UI", {
	    ClockControl: WinJS.Class.define ( 
		function (element, options) {

		    var ControlContainer = element || document.getElementById("ClockControl");
		    ControlContainer.winControl = this;
		    this.element = ControlContainer;
         
		    var Hours = document.createElement("span");
		    this.Hours = Hours;
		    Hours.className = "Hours";
		    Hours.innerHTML = "00";
		    ControlContainer.appendChild(Hours);


		    var TickSeparator = document.createElement("span");
		    this.TickSeparator = TickSeparator;
		    TickSeparator.className = "TickSeparator";
		    TickSeparator.innerText = ":";
		    ControlContainer.appendChild(TickSeparator);

		    var Mins = document.createElement("span");
		    this.Mins = Mins;
		    Mins.className = "Mins";
		    Mins.innerHTML = "00";
		    ControlContainer.appendChild(Mins);

		    setTimeout(this._drowtime.bind(this), 0);
		    setInterval(this._tick.bind(this), 1000);
		    setInterval(this._drowtime.bind(this), 10000); // redraw once per 10 sec
	    },
		{       
		_drowtime: function () {
			var now = new Date();
			var hours = now.getHours();
			var mins = now.getMinutes();
			if (mins < 10) mins = "0" + mins;
			this.Hours.innerHTML = hours
			this.Mins.innerHTML = mins;
		},
		_tick: function () {		    
		    if (this.TickSeparator.style.visibility == 'visible')
		        this.TickSeparator.style.visibility = 'hidden';
		    else
		        this.TickSeparator.style.visibility = 'visible';
		},
		}),
        DateControl: WinJS.Class.define ( 
            function (element, options) {
                var ControlContainer = element || document.getElementById("DateControl");
                ControlContainer.winControl = this;
                this.element = ControlContainer;
                var Date = document.createElement("span");
                this.Date = Date;
                Date.className = "Date";
                Date.innerHTML = "00.00";
                ControlContainer.appendChild(Date);
                setTimeout(this._drowdate.bind(this), 0);
                setInterval(this._drowdate.bind(this), 1000 * 3600); // redraw once per hour
            },
            {       
                _drowdate: function () {
                    var now = new Date();
                  /*  var day = now.getDate();
                    var month = now.getMonth();
                   // if (day < 10) day = "0" + day;
                    // if (month < 10) month = "0" + month;
                    switch (month) {
                        case 0: month = "января"; break;
                        case 1: month = "февраля"; break;
                        case 2: month = "марта"; break;
                        case 3: month = "апреля"; break;                        
                        case 4: month = "мая"; break;
                        case 5: month = "июня"; break;
                        case 6: month = "июля"; break;
                        case 7: month = "августа"; break;
                        case 8: month = "сентября"; break;
                        case 9: month = "октября"; break;
                        case 10: month = "ноября"; break;
                        case 11: month = "декабря"; break;
                    }
					*/
                	//this.Date.innerHTML = day + " " + month
                    var langs = Windows.System.UserProfile.GlobalizationPreferences.languages;
                    var m_datefmt1 = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("day month year", langs);
                    this.Date.innerHTML = m_datefmt1.format(now);
                }

            })
	});

})();