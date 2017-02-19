var mwpsApp = {

  loadSiteSettings: function(){
    var self = this;
    //set default settings, in case data call fails
    var defaultSettings = [
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
    //get settings and update page
    $.getJSON( "api/settings", function( data ) {
      for(var i=0; i < data.settings.length;i++){
        for(var y=0; y < defaultSettings.length; y++){
          if(defaultSettings[y].key == data.settings[i].key && data.settings[i].value){
              defaultSettings[y].value = data.settings[i].value;
            break;
          }
        }
      }
      self.updateSettingsOnPage(defaultSettings);
    }).fail(function(){
      self.updateSettingsOnPage(defaultSettings);
    });

   // return settings;
  },

  updateSettingsOnPage: function(settings){
    //loop through the settings
    for(var x=0; x< settings.length; x++){
      var currentSetting = settings[x];
      $('.setting.' + currentSetting.key).text(currentSetting.value);
    }
  },

  postContactForm: function(){
    $('#contactPageForm').submit(function(event){
      debugger;
      //get form data as josn
      var $form = $(event.target);
      var formData = {};
      $.each($form.serializeArray(), function (i, field) {
        formData[field.name] = field.value || "";
      });

      /*var formData = {
        name: 'Mister Larios'
      };*/
      $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : 'api/contact', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true
      })
      // using the done promise callback
      .done(function(data) {
debugger;
        // log data to the console so we can see
        console.log(data);

        // here we will handle errors and validation messages
      });

      // stop the form from submitting the normal way and refreshing the page
      event.preventDefault();
    });


    /* $('#contactPageForm').formValidation({

     })
     .on('success.form.fv', function(e) {
       debugger;


       // Prevent form submission
       e.preventDefault();

       var $form = $(e.target),
           fv    = $(e.target).data('formValidation');
       var formData = JSON.stringify($form.serializeArray());

       $.ajax({
         type: "POST",
         url: "/api/contact",
         data: formData,
         success: function(){
           debugger;
         },
         error: function(){
           debugger;
         },
         dataType: "json",
         contentType : "application/json"
       });

       // Do whatever you want here ...

       // Then submit the form as usual
       //fv.defaultSubmit();
     });*/
  },

  registerEventHandlers: function(){
    $("button.tuitionToggleBtn").click(function() {
      var clickedButton = $(this);

      if(clickedButton.hasClass('schoolDayBtn')) {
        //toggle details
        $(".dayExplanation").slideToggle(1000);
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
        $(".extendedExplanation").slideToggle(1000);
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
  mwpsApp.loadSiteSettings();

  mwpsApp.postContactForm();
});
