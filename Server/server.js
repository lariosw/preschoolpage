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
        handleFailure(res, 'Failed to retrieve settings');
    });
});

app.get('/api/gallery', function(req, res){
  mwpsApi.getGalleryImages().done(function(settings){
    handleSuccess(res, settings);
  }, function(err){
    console.log(err);
    handleFailure(res, 'Failed to retrieve gallery');
  });
});

app.post('/api/contact', function(req, res){
    mwpsApi.sendContactEmail(req.body.name, req.body.email, req.body.phone, req.body.message).done(function(emailResponse){
        handleSuccess(res, emailResponse);
    }, function(err){
        handleFailure(res, 'Failed to send email');
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

function handleFailure(res, data){
  if(res.send) res.sendStatus(500).send(data);
  else {
      res.writeHead(500, JSON.stringify(data));
      res.end();
  }
}

if(process.argv.length > 2 && (process.argv[2] === '--dev' || process.argv[2] === 'dev')){
  app.listen(3001, function () {
      console.log('MWPS Api listening on port 3001!')
  });
  mwpsApi.init('DEV');
}

if(process.argv.length > 2 && (process.argv[2]  === '--dist' || process.argv[2]  === 'dist')){
  app.listen(3000, function () {
    console.log('MWPS Api listening on port 3000!')
  });
  app.use(express.static(__dirname + '/../dist/html'));
  app.use(express.static('dist'));
  mwpsApi.init('DIST');
}


if(process.argv.length > 2 && (process.argv[2] === '--prod' || process.argv[2] === 'prod')){
  app.listen(3000, function () {
    console.log('MWPS Api listening on port 3000!')
  });
  mwpsApi.init('PROD');
}

module.exports = app;
