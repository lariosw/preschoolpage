var mwpsApp = {
  getSiteSettings: function(){
    var settings = [
      {
        key: "startDate",
        value: "Our first day of school is Wednesday September 7th, 2016"
      },
      {
        key: "schoolYear",
        value: "2016-2017"
      },
      {
        key: "threeDayCost",
        value:"$220"
      }
    ];

    return settings;
  },

  loadSiteSettings: function () {
    //get all settings
    var appSettings = this.getSiteSettings();

    //loop through the settings
    for(var x=0; x<appSettings.length; x++){
      var currentSetting = appSettings[x];
      $('.setting.' + currentSetting.key).text(currentSetting.value);
    }

  },

  registerEventHandlers: function(){
    $("button.tuitionToggleBtn").click(function() {
      var clickedButton = $(this);

      if(clickedButton.hasClass('schoolDayBtn')) {
        //toggle details
        $(".dayExplanation").toggle(1000);
        //show corresponding buton
        if (clickedButton.hasClass('showBtn')) {
          $(".schoolDayBtn.hideBtn").show();
          clickedButton.hide();
        }
        else {
          $(".schoolDayBtn.showBtn").show();
          clickedButton.hide();
        }
      }
      else {
        //toggle details
        $(".extendedExplanation").toggle(1000);
        if (clickedButton.hasClass('showBtn')) {
          $(".extDayBtn.hideBtn").show();
          clickedButton.hide();
        }
        else {
          $(".extDayBtn.showBtn").show();
          clickedButton.hide();
        }
      }
    });
  }
};


$(document).ready(function() {
  //register all the events
  mwpsApp.registerEventHandlers();

  //load the application settings
  mwpsApp.loadSiteSettings()();
});
