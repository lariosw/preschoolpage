/*
* Server to handle api calls
 */

var express = require('express');
var bodyParser = require('body-parser');
var mwpsApi = require('./api');
var app = express();

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

//helper methods
function handleSuccess(res, data){
  if(res.send) res.send(data)
  else res.end(JSON.stringify(data));
}

function handleFailure(res, err, data){
  if(res.send) res.sendStatus(500).send(data);
  else {
    res.writeHead(500, JSON.stringify(data));
    res.end();
  }
}

module.exports = app;

//Setup listener if correct argument passed and called through terminal (not require)
mwpsApi.init("DEV");
if (require.main === module) {
  if (process && process.argv && process.argv.length > 2) {
    var apiPort = 3000;
    appMode = process.argv[2].toString().replace('--', '').toUpperCase();
    if (!(appMode == 'DEV' || appMode == "DIST" || appMode == "PROD")) {
      console.log("Server listener not started. Argument DEV, DIST and PROD must be passed.");
      return;
    }
    app.listen(apiPort, function () {
      console.log('MWPS Api listening on port ' + apiPort + ' [' + appMode + ' MODE]');
      mwpsApi.init(appMode);
    });
    if(appMode == "DIST"){
      app.use(express.static(__dirname + '/../www'));
    }
  }
}


