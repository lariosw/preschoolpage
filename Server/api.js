/*
 * Implementation for all the api endpoints
 * Google API Documentation at: http://google.github.io/google-api-nodejs-client/16.1.0/index.html
 */
var google = require('googleapis');
var googleSheets = google.sheets('v4');
var googleDrive = google.drive('v2');
//var googleCalendar = google.calendar('v3');
var promise = require('promise');
var emailJS = require("emailjs/email");
var fs = require('fs');
var path = require('path');
var request = require('request');
var cachedData = {};
var util = require('./util');
var currentAppMode = "DEV";

// App Constants
var settings = {
  appModes: {
    DEV: "DEV",
    DIST: 'DIST',
    PROD: "PROD"
  },
  authKey: {
    type: "service_account",
    project_id: "mwp-website-157805",
    private_key_id: "f0693c7d55dc89cc7d0ed0111ee336f862567199",
    client_email: "456382756111-compute@developer.gserviceaccount.com",
    client_id: "109075384790467502265",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzgDILqtJl6nl5\nb51qblfqkXzni9CdZMx1miVlcDEVzhlolXsSgbJZCyZOHtJS/KhVKXlp4aGL4O8H\nyvJzetfMrYzZ/DWI83vnZYle2CuDmHVN78FwwwY7dbgxntNsJo0XsA/fzMSyUazb\nOZ3oO960C/fqwk1pUgFujQ1a/yU2E7i6N9elEN6NPy/bDRC28ORRbpF+UF6pkD6B\nLlIxwHTUFpJsfghygN8Y669iVk/BwHe839VOyTSdAM6f/m9wUixbrJYqZd2JmAmJ\nXinqhP1uB9ebqrQhyhJ9pBzjCiVqi5kI3ZM6955ay5HurvneClHpSpMdkcc7I26W\nKLgzQT2bAgMBAAECggEATb8+7fLFQsN2bfS8N/cnOUBe22OhriqUrHNhszgO6qTk\nOHpWXkOy3gKIStnqu2sX9hsKraO+9vksTzHGJeKVSd/53AjznyfnCOjfwSbcYhlM\n5b7tCExQjLyGVWe3p2ZjQllN5t+oapwZxLKGBKq54T412YbjRLTyTdHmcP2GPo8+\ne8FRF7k8A4uHezb702otr8UC4vB/iIG1UV6Q76Qw3Pe1lDKBo6vEoEb0xB2C1NoO\nIc1CLxUXEDvf+/9D9ir/WRjPbUqOT+6bVHOx5e2jjsE0YjmiglmaYKdF8fzgqU2y\nNT4Au+JkTy2l7kLVrM7eB4npoiEYdudpGTlJeE/xsQKBgQDbG9JXNzo5NiRbixlf\nXsh1jyS87+WYYNPHLrZ1coemYtU+DkvTzW4dz+ITj545khz0v1IiTmW+IpLkID9+\n3xjsmlpXFL5EuFJk9jBqysH2qoSao68i4bdhUOECkFsD24ZKYzScGQ92rEEgtz8Q\nmgE7BdaPqiwvqV5w/jYgQKT2TwKBgQDRuSpQfsW2IC+ihff+hXeNIkHeuss25gIX\nOp/PxsTuibVSKxQMlTlaBdEyh/iUIrdX9I764EoC3eUxcJ6Zgetny+z2rtNXI9+d\nJvJ0omiOoiMgXfbMicoaubT01KI6jnC46brgWkfSY29SkokSzu8bxdrZqJThQDUA\nL2a+9yk89QKBgF9j+WsnDB4kSCfioyU2Kqejribjel2gqhKpb54qQoxZsuTVbIXF\nhg9MlexWNlhyGFEliiiNYRYqDzFqKLqffkZj3LjUuxFH/fceh2224EL3ccuxP2o8\nQo4HnC51kmpXhFuWXS0oa+cKj0AjBz2/DpIXtJXPTHVjk042HnJkMm1ZAoGANUmj\nIsjTW69Z6yW3GYi4E7g8nGdB8zUGGvjeWmDa8PE0jSg88+WGqQUJXpmF473ecA7H\ntZ7/rzLKZYGECuUj9z+tehB5yo5m5vtaZ6BMiNFRs4ushdQM8jV1cTAF+HLw2Usq\nHI9T6HUzd/ubsJe70Ya4UM2w5nr1/JIOvT73z3ECgYBKAvirvBTnFu6l7kLVRqoU\nmGrrh284Xz2j6dEQ62ZlKzjWYAFP2dvvcw8GRaNJF+/LlXdXj9FglqxXdAW9Z9tq\nn2hNPxhyjrVzLUjKCMkpJSnfIXX1WptT2NoVktb8N7r6r+Y4jWt2ldFukUSYASHG\n0A13Pc0bULpw8GIzXWD4NA==\n-----END PRIVATE KEY-----\n"
  },

  googleApiScopes: {
    CALENDAR_MANAGE: 'https://www.googleapis.com/auth/calendar',
    CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
    SHEETS_MANAGE: 'https://www.googleapis.com/auth/spreadsheets',
    SHEETS_READONLY: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly'
  },

  configSheet: {
    ID: "1RMk1xu0EFccTx2vQNeRuDRbqZVFIjAf5UMar5RHfrxg",
    RANGES: "A2:B30" //skip first row, it is a header row
  },

  gallery: {
    FOLDER_ID: '0B18c97fJramUSzBiakQxMEw4MzA',
    DEV_DIRECTORY: __dirname + '/../app/images/gallery/',
    DIST_DIRECTORY: "html/images/gallery/",
    PROD_DIRECTORY: "/var/www/maplewoodpres.com/html/images/gallery/",
    RELATIVE_URL: "images/gallery/",
    MAX_RETRIES: 4
  },

  contactEmail: {
    to: "maplewoodpreschooledmonds@gmail.com",
    from: "maplewoodpreschooledmonds@gmail.com",
    subject: "Message from preschool website contact page",
    username: "maplewoodpreschooledmonds@gmail.com",
    password: "",
    smtpHost: "smtp.gmail.com",
    useSSL: true,
    sslPort: 465
  }
};

function getSiteSettings() {
  return new promise(function(fullfil, reject) {
    if(cachedData.settings){
      //if data is already cached, return it and DON'T make call
      fullfil(cachedData.settings);
      return;
    }
    jwtAuthorize([settings.googleApiScopes.SHEETS_READONLY]).done(function(authtoken) {
      var request = {
        spreadsheetId: settings.configSheet.ID,
        ranges: settings.configSheet.RANGES,
        auth: authtoken
      };
      googleSheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) reject(err);
        else {
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
        }
      });

    }, reject);
  });
}

function getGalleryDirectory(){
  var dir = settings.gallery.DEV_DIRECTORY;
  //overwrite directory if needed
  if(currentAppMode == settings.appModes.DIST) dir = settings.gallery.DIST_DIRECTORY;
  if(currentAppMode == settings.appModes.PROD) dir = settings.gallery.PROD_DIRECTORY;
  util.ensureDirectoryExists(dir + "test.txt");
  return dir;
}

function initGalleryFromFS(){
  var galleryDirectory = getGalleryDirectory();
  var existingFiles = util.getDirectoryFiles(galleryDirectory);
  if(existingFiles && existingFiles.length > 0) {
    cachedData.gallery = {images: []};
    util.foreach(existingFiles, function (fName) {
      cachedData.gallery.images.push(settings.gallery.RELATIVE_URL + fName);
    });
  }
}

function getGalleryImages() {
  var galleryDirectory = getGalleryDirectory();

  if(!cachedData.gallery){
    initGalleryFromFS();
  }

  //setup promise
  return new promise(function(fullfil, reject) {
    if(cachedData.gallery && cachedData.gallery.complete){
      //if data is already cached, return it and DON'T make call
      fullfil(cachedData.gallery);
      return;
    }
    jwtAuthorize([settings.googleApiScopes.DRIVE_READONLY]).done(function(authtoken) {

      var listRequest = {
        auth: authtoken,
        folderId: settings.gallery.FOLDER_ID
      };
      googleDrive.children.list(listRequest, function(err, response) {
        if (err) {
          if(cachedData.gallery) fullfil(cachedData.gallery);
          else reject(err)
        }
        else {
          var reqCnt = 0,
            completedReqCnt = 0,
            galleryResp = { images: [] };

          //get list of existing files and generate list of files that need to be created/deleted
          var existingFiles = util.getDirectoryFiles(galleryDirectory);
          var responseIds = [];
          var filesToAdd = {};
          util.foreach(response.items, function(item){
            responseIds.push(item.id);
          });
          var filesToAddIds = util.arrayDiff(responseIds, existingFiles, true);
          util.foreach(filesToAddIds, function(id){
            filesToAdd[id] = { retries: 0 }
          });
          util.foreach(util.arrayDiff(existingFiles, responseIds, true), function(fName){
            util.deleteFile(galleryDirectory + fName);
          });

          //check if we already have all files
          if(filesToAddIds.length == 0){
            cachedData.gallery = cachedData.gallery || {};
            cachedData.gallery.complete = true;
            fullfil(cachedData.gallery);
            return;
          }
          //fns to handle image request
          function retryImage(fileId){
            if(filesToAdd[fileId].retries < settings.gallery.MAX_RETRIES){
              filesToAdd[fileId].retries++;
              setTimeout(function() {
                requestImageData(fileId);
              }, filesToAdd[fileId].retries * 500);
            }
            else completedReqCnt++;
          }
          function checkIfComplete(){
            if(completedReqCnt == filesToAddIds.length){
              var allSuccessful = true;
              for(var fId in filesToAdd){
                if(filesToAdd.hasOwnProperty(fId) && !filesToAdd[fId].completed) allSuccessful = false;
              }
              cachedData.gallery = galleryResp;
              cachedData.gallery.complete = allSuccessful;
              fullfil(cachedData.gallery);
            }
          }
          function requestImageData(fileId){
            var imgReqUrl = 'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media';
            request({
              uri: imgReqUrl,
              encoding: 'binary',
              headers: {
                Authorization: 'Bearer ' + authtoken.credentials.access_token
              }
            }, function(error, response, body) {
              var fExt = error ? '' : contentTypeToExt(response.headers['content-type']);
              if (fExt) {
                fs.writeFile(galleryDirectory + fileId + fExt, body, 'binary', function(err) {
                  if (err) retryImage(fileId)
                  else {
                    galleryResp.images.push(settings.gallery.RELATIVE_URL + fileId + fExt);
                    filesToAdd[fileId].completed = true;
                    completedReqCnt++;
                    checkIfComplete();
                  }
                });
              }
              else{
                retryImage(fileId);
              }
              checkIfComplete();
            });
          }

          //request imageData
          for(var i=0; i < filesToAddIds.length;i++){
            requestImageData(filesToAddIds[i]);
          }
        }
      });
    }, reject);
  });
}

function jwtAuthorize(scopes) {
  return new promise(function(fullfil, reject) {
    var jwtClient = new google.auth.JWT(
      settings.authKey.client_email,
      null,
      settings.authKey.private_key,
      scopes,
      ""
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) reject('from jwt: ' + err)
      else fullfil(jwtClient);
    });
  });
}

function contentTypeToExt(contentType) {
  if (contentType.indexOf('jpeg') > 0) return ".jpeg";
  if (contentType.indexOf('png') > 0) return ".png";
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function sendContactEmail(name, email, phoneNum, message) {

  function buildSpan(name, value) {
    return "<span style='font-weight:bold'>" + name + ":   </span>" + (value ? value : "(Not Provided)") + "<br/><br/>";
  }

  return new promise(function(fullfil, reject) {
    //build message body
    var emailBody = "<span>The following information was typed in:</span><br/><br/>";
    emailBody += buildSpan("Name", name);
    emailBody += buildSpan("Email", email);
    emailBody += buildSpan("Phone Number", phoneNum);
    emailBody += buildSpan("Message", message);

    //initialize server
    var server = emailJS.server.connect({
      user: settings.contactEmail.username,
      password: settings.contactEmail.password,
      host: settings.contactEmail.smtpHost,
      ssl: settings.contactEmail.useSSL,
      port: settings.contactEmail.sslPort

    });

    //send message
    server.send({
      text: "",
      from: settings.contactEmail.from,
      to: settings.contactEmail.to,
      subject: settings.contactEmail.subject,
      attachment: [{
        data: emailBody,
        alternative: true
      }]
    }, function(err, message) {
      if (err) reject(err);
      else fullfil({ msg: 'success'});
    });
  });
}


/*
 * PUBLIC METHODS
 */

//method to get application settings
module.exports.getSiteSettings = getSiteSettings;

//method to send contact page email
module.exports.sendContactEmail = sendContactEmail;

module.exports.getGalleryImages = getGalleryImages;

module.exports.init = function(appMode){
  currentAppMode = appMode;
  initGalleryFromFS();
};

module.exports.resetCache = function(){
  cachedData = {};
}
