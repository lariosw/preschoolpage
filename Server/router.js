/*
 * Router that can used by both browsersyncs middleware (connect) and express
 * The key difference is the way the response is handle with 'end()' for connect
 * and 'send()' for express.
 *
*/

var mwpsApi = require('./api');
var express = require('express');
var router = express.Router();

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

router.get('/api/settings', function(req, res){
    mwpsApi.getSiteSettings().done(function(settings){
        handleSuccess(res, settings);
    }, function(err){
        handleFailure(res, 'Failed to retreive settings');
    });
});

router.post('/api/contact', function(req, res){
    console.log(req);
    mwpsApi.sendContactEmail(req.body.name, "larios@domain", "618-8972", "Please respond").done(function(settings){
        res.send(settings)
    }, function(err){
        res.status(500).send('Failed to send email');
    });
});


module.exports = router;