/*
* Helper to manage an image gallery mapped to a google drive folder.
* Handles caching of response to limit requests to google server
*/

/*
* INCLUDES
*/
var util = require('./util');
var googleApiUtil = require('./googleApiUtil');
var promise = require('promise');

/*
* MODULE SETTINGS
*/
var settings = {
  MAX_FILE_DOWNLOAD_RETRIES: 4
};

/*
* PRIVATE FUNCTIONALITY
*/

var galleriesCache = {};

function getGalleryImages(folderId, galleryDirectory, relativePath, useCache){
  if(useCache && !galleriesCache[galleryDirectory]){
    initGalleryFromFS(galleryDirectory, relativePath);
  }

  return new promise(function(fullfil, reject) {
    if(useCache && galleriesCache[galleryDirectory] && galleriesCache[galleryDirectory].complete){
      //if data is already cached, return it and DON'T make call
      fullfil(galleriesCache[galleryDirectory]);
      return;
    }

    googleApiUtil.getFolderFiles(folderId).done(function(files){
      var reqCnt = 0,
        completedReqCnt = 0,
        galleryResp = { images: [] };

      //get list of existing files and generate list of files that need to be created/deleted
      var existingFiles = util.getDirectoryFiles(galleryDirectory);
      var responseIds = [];
      var filesToAdd = {};
      util.foreach(files, function(item){
        responseIds.push(item.id);
      });
      //determine which files need to be downloaded
      var filesToAddIds = util.arrayDiff(responseIds, existingFiles, true);
      //determine which files need to be deleted
      util.foreach(util.arrayDiff(existingFiles, responseIds, true), function(fName){
        util.deleteFile(galleryDirectory + fName);
      });

      //check if we already have all files
      if(useCache && filesToAddIds.length == 0){
        galleriesCache[galleryDirectory] = galleriesCache[galleryDirectory] || {};
        galleriesCache[galleryDirectory].complete = true;
        fullfil(galleriesCache[galleryDirectory]);
        return;
      }

      //download all the files
      googleApiUtil.downloadFiles(filesToAddIds, settings.MAX_FILE_DOWNLOAD_RETRIES, galleryDirectory).done(function(downloadResults){
        //load file list from directory
        initGalleryFromFS(galleryDirectory, relativePath);
        galleriesCache[galleryDirectory].complete = true;
        util.foreach(filesToAddIds, function(id){
          if(!downloadResults[id].downloaded) galleriesCache[galleryDirectory].complete = false;
        });
        fullfil(galleriesCache[galleryDirectory]);
      }, reject);

    }, reject);
  });
}

function initGalleryFromFS(path, relativePath){
  //ensure directory exits
  util.ensureDirectoryExists(path + "test.txt");
  //get list of files in directory
  var existingFiles = util.getDirectoryFiles(path);
  //add files to cache
  if(existingFiles && existingFiles.length > 0) {
    galleriesCache[path] = {images: []};
    util.foreach(existingFiles, function (fName) {
      galleriesCache[path].images.push(relativePath + fName);
    });
  }
}

/*
* PUBLIC FUNCTIONALITY
*/

//method to retrieve images for specific gallery mapped to specified google drive folder by id
module.exports.getGalleryImages = getGalleryImages;

module.exports.resetCache = function(){
  galleriesCache = {};
};
