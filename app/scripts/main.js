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
      },
      {
        key: "fourDayCost",
        value:"$270"
      },
      {
        key: "fiveDayCost",
        value:"$310"
      },
      {
        key: "lunchFee",
        value:"$5"
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
  },

  loadSiteImages: function(){
    var defaultItemHeight = "200",
      defaultItemWidth = "200";

    //get settings and update page
    $.getJSON( "api/gallery", function( data ) {
      var itemHtml = '<a href="{url}" data-lightbox="gallery-img">';
      itemHtml += '<div class="img-item" style="background-image:url({url});height:' + defaultItemHeight + 'px;width:{width}px"></div>';
      itemHtml += "</a>"
      var allImagesHtml = "";
      var w = 1;
      //loop through images and build the html for each image
      for (var i = 0; i < data.images.length; ++i) {
        w = 200 +  200 * Math.random() << 0;
        allImagesHtml += itemHtml.replace(/\{url\}/g, data.images[i]).replace(/\{width\}/g,w);
      }
      //append generated html into page
      $('#gallery-imgs-container').html(allImagesHtml);
      //initialize freewall plugin
      var wall = new Freewall("#gallery-imgs-container");
      wall.reset({
        selector: '.img-item',
        animate: true,
        cellW: defaultItemWidth,
        cellH: defaultItemHeight,
        onResize: function() {
          wall.fitWidth();
        }
      });
      wall.fitWidth();
      $(window).trigger("resize");

    }).fail(function(err){
      //todo: handle error
    });
  },

  updateSettingsOnPage: function(settings){
    //loop through the settings
    for(var x=0; x< settings.length; x++){
      var currentSetting = settings[x];
      $('.setting.' + currentSetting.key).text(currentSetting.value);
    }
  },

  setupContactForm: function(){
    $('#contactPageForm').submit(function(event){

      //get form data as josn
      var $form = $(event.target);
      var formData = {};
      $.each($form.serializeArray(), function (i, field) {
        formData[field.name] = field.value || "";
      });

      $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : 'api/contact', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true
      })
      // using the done promise callback
      .done(function(data) {
        //todo: what to do when done?
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
    $('.toggleWrapper .toggleShowButton, .toggleWrapper .toggleHideButton').click(function(){
      var $clickedButton = $(this),
          $toggleWrapper = $clickedButton.parents('.toggleWrapper'),
          $toggleContent = $toggleWrapper.find('.toggleContent');

      if($clickedButton.hasClass('toggleShowButton')) {
        $toggleContent.slideToggle(1000);
        $toggleWrapper.find('.toggleHideButton').show();
        $clickedButton.hide();
      }
      else {
        $toggleContent.slideToggle(1000);
        $toggleWrapper.find('.toggleShowButton').show();
        $clickedButton.hide();
      }
    });
  }
};


$(document).ready(function() {
  //register all the events
  mwpsApp.registerEventHandlers();

  //load the application settings
  mwpsApp.loadSiteSettings();

  //load site images
  mwpsApp.loadSiteImages();

  //setup the contact form save functionality
  mwpsApp.setupContactForm();

  //lightbox configurations
  lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true,
    fitImagesInViewport: false,
    maxHeight: 100,
    positionFromTop: 150,
  })
});
