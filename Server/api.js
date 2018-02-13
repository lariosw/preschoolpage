/*
 *  API for Maplewood site
 */
var appConfig = require('./config.json');
var googleApiUtil = require('./helpers/googleApiUtil');
var googleGalleryUtil = require('./helpers/googleGalleryUtil');
var mailUtil = require('./helpers/mailUtil');
var util = require('./helpers/util');
var promise = require('promise');
var cachedData = {};
var currentAppMode = "DEV";

// App Constants
var settings = {
  appModes: {
    DEV: "DEV",
    DIST: 'DIST',
    PROD: "PROD"
  },
  configSheet: {
    ID: "1RMk1xu0EFccTx2vQNeRuDRbqZVFIjAf5UMar5RHfrxg",
    RANGES: "A2:B30" //skip first row, it is a header row
  },
  gallery: {
    FOLDER_ID: '0B18c97fJramUSzBiakQxMEw4MzA',
    DEV_DIRECTORY: __dirname + '/../app/images/gallery/',
    DIST_DIRECTORY: __dirname + '/../www/images/gallery/',
    PROD_DIRECTORY: "/var/www/maplewoodpreschool.org/www/images/gallery/",
    RELATIVE_URL: "images/gallery/",
    MAX_RETRIES: 4
  },
  contactEmail: {
    TO: "",
    SUBJECT: "Message from preschool website contact page",
    USERNAME: "",
    PASSWORD: "",
  }
};

function getSiteSettings() {
  return new promise(function(fullfil, reject) {
    if(cachedData.settings){
      //if data is already cached, return it and DON'T make call
      fullfil(cachedData.settings);
      return;
    }
    googleApiUtil.getSheet(settings.configSheet.ID, settings.configSheet.RANGES).done(function(response){
      var formattedSettings = {
        settings: []
      };
      for (var i = 0; i < response.valueRanges[0].values.length; i++) {
        formattedSettings.settings.push({
          "key": response.valueRanges[0].values[i][0],
          "value": response.valueRanges[0].values[i][1]
        });
      }
      cachedData.settings = formattedSettings;
      fullfil(formattedSettings);
    }, reject);
  });
}

function getGalleryImages(){
  var dir = settings.gallery.DEV_DIRECTORY,
    relativeDir = settings.gallery.RELATIVE_URL,
    folderId = settings.gallery.FOLDER_ID;

  //overwrite directory if needed
  if(currentAppMode == settings.appModes.DIST) dir = settings.gallery.DIST_DIRECTORY;
  if(currentAppMode == settings.appModes.PROD) dir = settings.gallery.PROD_DIRECTORY;
  return googleGalleryUtil.getGalleryImages(folderId, dir, relativeDir, true);
}

function sendContactEmail(name, email, phoneNum, message) {
  var s = settings.contactEmail;

  function buildSpan(name, value) {
    return "<span style='font-weight:bold'>" + name + ":   </span>" + (value ? value : "(Not Provided)") + "<br/><br/>";
  }

  //build message body
  var emailBody = "<span>The following information was typed in:</span><br/><br/>";
  emailBody += buildSpan("Name", name);
  emailBody += buildSpan("Email", email);
  emailBody += buildSpan("Phone Number", phoneNum);
  emailBody += buildSpan("Message", message);

  return mailUtil.sendThroughGmail(s.USERNAME, s.PASSWORD, s.TO, s.SUBJECT, emailBody);
}


/*
 * PUBLIC METHODS
 */

//method to get application settings
module.exports.getSiteSettings = getSiteSettings;

//method to get the gallery images
module.exports.getGalleryImages = getGalleryImages;

//method to send contact page email
module.exports.sendContactEmail = sendContactEmail;

module.exports.resetCache = function(){
  cachedData = {};
  googleGalleryUtil.resetCache();
}



module.exports.init = function(appMode){
  //set app mode
  currentAppMode = appMode;
  //load config
  settings.contactEmail.TO = appConfig.permissions.mailerDestination;
  settings.contactEmail.USERNAME = appConfig.permissions.googleMailer;
  settings.contactEmail.PASSWORD = appConfig.permissions.googleMailerPassword;
  googleApiUtil.setAuth(appConfig.permissions.googleApiAccount, appConfig.permissions.googleApiKey);
};





