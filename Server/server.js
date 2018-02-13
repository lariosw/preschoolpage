/*
* Server to handle api calls
 */

var express = require('express');
var bodyParser = require('body-parser');
var mwpsApi = require('./api');
var app = express();
var appCfg = require('./config.json');

//set encoding for request bodies
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//setup routes
app.get('/api/settings', function(req, res){
    mwpsApi.getSiteSettings().done(function(settings){
        handleSuccess(res, settings);
    }, function(err){
        handleFailure(res, err, 'Failed to retrieve settings');
    });
});

app.get('/api/gallery', function(req, res){
  mwpsApi.getGalleryImages().done(function(settings){
    handleSuccess(res, settings);
  }, function(err){
    handleFailure(res, err, 'Failed to retrieve gallery');
  });
});

app.post('/api/contact', function(req, res){
    mwpsApi.sendContactEmail(req.body.name, req.body.email, req.body.phone, req.body.message).done(function(emailResponse){
        handleSuccess(res, emailResponse);
    }, function(err){
        handleFailure(res, err, 'Failed to send email');
    });
});

app.get('/api/reset', function(req, res){
  mwpsApi.resetCache();
  handleSuccess(res, "Reset Successful");
});

app.get('/api/test', function(req, res){
  handleSuccess(res, 'Success!');
});

//helper methods
function handleSuccess(res, data){
  if(res.send) res.send(data)
  else res.end(JSON.stringify(data));
}

function handleFailure(res, err, data){
  if(res.send) res.status(500).send(data);
  else {
    res.writeHead(500, JSON.stringify(data));
    res.end();
  }
}

module.exports = app;

//Setup listener if necessary
if(!(appCfg.appMode === "DEV" || appCfg.appMode === "DIST" || appCfg.appMode === "PROD")){
  throw('Invalid application mode. Set app mode in config.json to DEV, DIST or PROD')
}
if(appCfg.appMode != "DEV") {
  app.listen(appCfg.apiPort, function () {
    console.log("API for '" + appCfg.appName + "' listening on port " + appCfg.apiPort + ' [' + appCfg.appMode + ' MODE]');
    mwpsApi.init(appCfg.appMode);
  });
  if(appCfg.appMode == "DIST"){
    app.use(express.static(__dirname + '/../www'));
  }
}
else {
  mwpsApi.init("DEV");
}


