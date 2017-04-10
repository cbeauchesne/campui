var express = require('express')
var proxyMiddleware = require('http-proxy-middleware');

var app = express()

api_url = process.env.API_URL || 'http://localhost:8000'
port = process.env.PORT || 3000

var apiProxy = proxyMiddleware('/api', {
  target: api_url,
  logLevel: 'debug'
});

app.use(apiProxy);
app.use(express.static(__dirname + '/static'));

app.get('/[^\.]+$', function(req, res){
    res.set('Content-Type', 'text/html')
        .sendFile(__dirname + '/static/index.html');
});

app.listen(port, function () {
  console.log('CampUI app listening on port ' + port )
})