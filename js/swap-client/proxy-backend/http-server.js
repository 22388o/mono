const express = require('express');
const app = express(), app2 = express();;
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
//const WebSocket = require('ws');

const proxyMiddleware = createProxyMiddleware({
    target: 'https://127.0.0.1:11001', // Replace with the target URL of your destination server
    changeOrigin: true,
    secure: false // Set to true if your destination server uses HTTPS
});
const proxyMiddleware2 = createProxyMiddleware({
    target: 'https://127.0.0.1:11002', // Replace with the target URL of your destination server
    changeOrigin: true,
    secure: false // Set to true if your destination server uses HTTPS
});

app.use(cors()); app2.use(cors());

app.use('/', proxyMiddleware); app2.use('/', proxyMiddleware2);

app.listen(3000, () => console.log(`Server is running on port ${3000}`));
app2.listen(3001, () => console.log(`Server is running on port ${3001}`));

/*
const http = require('http'),
    httpProxy = require('http-proxy');

var proxy = new httpProxy.createProxyServer({
    target: 'https://127.0.0.1:11002',
    ws: true,
    secure: false,
    headers: {
        rejectUnauthorized: false
    }
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxy.on('upgrade', function (req, socket, head) {
    console.log(req.parsedUrl);
    proxy.ws(req, socket, head);
});
var proxyServer = http.createServer(function (req, res) {
    proxy.web(req, res);
});


proxyServer.listen(5001, () => console.log(`WS proxy server is running on port ${5001}`));
  */
