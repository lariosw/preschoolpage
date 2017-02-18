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
        handleFailure(res, 'Failed to retreive settings');
    });
});

app.post('/api/contact', function(req, res){
    mwpsApi.sendContactEmail(req.body.name, req.body.email, req.body.phone, req.body.message).done(function(emailResponse){
        handleSuccess(res, 'Successfully Sent!');
    }, function(err){
        res.status(500).send('Failed to send email');
    });
});

//helper methods
function handleSuccess(res, data){
    if(res.send) res.send(data)
    else res.end(JSON.stringify(data));
}

function handleFailure(res, data){
    if(res.send) res.status(500).send(data);
    else {
        res.writeHead(500, JSON.stringify(data));
        res.end();
    }
}

if(process.argv.length > 2 && process.argv[2] === '--listen'){
    app.listen(3000, function () {
        console.log('MWPS Api listening on port 3000!')
    });
}

if(process.argv.length > 3 && process.argv[3] === '--static'){
    app.use(express.static(__dirname + '/../dist/html'));
    app.use(express.static('dist'));
}

module.exports = app;