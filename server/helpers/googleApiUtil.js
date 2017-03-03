/*
 * Wrapper for google api's
 * Google API Documentation at: http://google.github.io/google-api-nodejs-client/16.1.0/index.html
 */

/*
* INCLUDES
*/

var google = require('googleapis');
var googleSheets = google.sheets('v4');
var googleDrive = google.drive('v2');
//var googleCalendar = google.calendar('v3');
var promise = require('promise');
var fs = require('fs');
var request = require('request');
var util = require('./util');

/*
* MODULE SETTINGS
*/

var settings = {
  authKey: {
    CLIENT_EMAIL: "",
    PRIVATE_KEY: ""
  },

  googleApiScopes: {
    CALENDAR_MANAGE: 'https://www.googleapis.com/auth/calendar',
    CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
    SHEETS_MANAGE: 'https://www.googleapis.com/auth/spreadsheets',
    SHEETS_READONLY: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly'
  }
};

/*
* PRIVATE FUNCTIONALITY
*/

function getSheet(sheetId, cellRange) {
  return new promise(function(fullfil, reject) {
    jwtAuthorize([settings.googleApiScopes.SHEETS_READONLY]).done(function(authtoken) {
      var request = {
        spreadsheetId: sheetId,
        ranges: cellRange,
        auth: authtoken
      };
      googleSheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) reject(err);
        else {
          fullfil(response);
        }
      });

    }, reject);
  });
}

function getFolderFiles(folderId){
  return new promise(function(fullfil, reject) {
    jwtAuthorize([settings.googleApiScopes.DRIVE_READONLY]).done(function(authtoken) {
      var listRequest = {
        auth: authtoken,
        folderId: folderId
      };
      googleDrive.children.list(listRequest, function(err, response) {
        if (err)  reject(err);
        else fullfil(response.items);
      });
    }, reject);
  });
}

function downloadFiles(fileList, maxRetriesPerFile, saveDirectory){
  var filesDownloadStatus = {};

  //init all files status as failed to start
  for(var i =0; i< fileList.length;i++){
    filesDownloadStatus[fileList[i]] = {
      name: "",
      downloaded: null,
      retries: 0
    }
  }

  return new promise(function(fullfil, reject) {
    jwtAuthorize([settings.googleApiScopes.DRIVE_READONLY]).done(function(downloadAuthToken) {
      //fns to handle image request
      function retryImage(fileId){
        if(filesDownloadStatus[fileId].retries < maxRetriesPerFile){
          filesDownloadStatus[fileId].retries++;
          setTimeout(function() {
            requestImageData(fileId);
          }, filesDownloadStatus[fileId].retries * 500);
        }
        else {
          filesDownloadStatus[fileId].downloaded = false;
        }
      }
      function checkIfComplete(){
        var allComplete = true;
        for(var fId in filesDownloadStatus){
          if(filesDownloadStatus.hasOwnProperty(fId)){
            if(!(filesDownloadStatus[fId].downloaded === true || filesDownloadStatus[fId].downloaded === false)){
              allComplete = false;
            }
          }
        }
        if(allComplete){
          fullfil(filesDownloadStatus);
        }
      }
      function requestImageData(fileId){
        var imgReqUrl = 'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media';
        request({
          uri: imgReqUrl,
          encoding: 'binary',
          headers: {
            Authorization: 'Bearer ' + downloadAuthToken.credentials.access_token
          }
        }, function(error, response, body) {
          var fExt = error ? '' : contentTypeToExt(response.headers['content-type']);
          if (fExt) {
            fs.writeFile(saveDirectory + fileId + fExt, body, 'binary', function(err) {
              if (err) retryImage(fileId)
              else {
                filesDownloadStatus[fileId].name = fileId + fExt;
                filesDownloadStatus[fileId].downloaded = true;
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
      for(var i=0; i < fileList.length;i++){
        requestImageData(fileList[i]);
      }
    }, reject);
  });
};

function jwtAuthorize(scopes) {
  return new promise(function(fullfil, reject) {
    var jwtClient = new google.auth.JWT(
      settings.authKey.CLIENT_EMAIL,
      null,
      settings.authKey.PRIVATE_KEY,
      scopes,
      ""
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) reject(err)
      else fullfil(jwtClient);
    });
  });
}

function contentTypeToExt(contentType) {
  if (contentType.indexOf('jpeg') > 0) return ".jpeg";
  if (contentType.indexOf('png') > 0) return ".png";
}

/*
* PUBLIC FUNCTIONALITY
*/

//method to initialize util with service account credentials details
module.exports.setAuth = function(clientEmail, privateKey){
  settings.authKey.CLIENT_EMAIL = clientEmail;
  settings.authKey.PRIVATE_KEY = privateKey;
};

//method to get cell data for a specified worksheetId and cell range
module.exports.getSheet = getSheet;

//method to get list of files in folder by folder id
module.exports.getFolderFiles = getFolderFiles;

//method to download list of files by array of file ids
module.exports.downloadFiles = downloadFiles;
