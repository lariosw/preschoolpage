/*var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(8080, 'APP_PRIVATE_IP_ADDRESS');
*/



var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');
var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', router);

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})