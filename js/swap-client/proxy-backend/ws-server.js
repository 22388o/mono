var WebSocket = require('ws'),
  WebSocketServer = WebSocket.Server;
  
wss = new WebSocketServer({ port: 5000 });
wss1 = new WebSocketServer({ port: 5001 });

wss.on('connection', function(ws, req) {
  console.log('Ccccc');
  const url = req.url;
  const arr = url.split('&');
  let opened = false;
  console.log(arr);
  const opts = {
    rejectUnauthorized: false,
    headers: { 'Grpc-Metadata-macaroon': arr[1] }
  }
  const server = new WebSocket(`wss://127.0.0.1:11001${arr[0]}`, opts)
  .on('open', () => { opened = true; console.log('Lightning network connection opened') })
  .on('close', (...args) => { console.log('lightning closed'); ws.close() })
  .on('error', err => {
    try {
      throw new Error(err);
    } catch(error) {
      ws.send(err);
    }
  })
  .on('message', buf => { 
    let obj = JSON.parse(buf)
    console.log(obj);
    ws.send(JSON.stringify(obj))
  })

  ws.on('message', function(message) {
    const req = JSON.parse(message);
    console.log('Received from client: %s', req);
    const id = setInterval(() => {
      if(opened) {
        server.send(JSON.stringify(req))
        clearInterval(id);
      }
    }, 1000);
    
  });
});

wss1.on('connection', function(ws, req) {
  console.log('123123');
  const url = req.url;
  const arr = url.split('&');
  let opened = false;
  console.log(arr);
  const opts = {
    rejectUnauthorized: false,
    headers: { 'Grpc-Metadata-macaroon': arr[1] }
  }
  const server = new WebSocket(`wss://127.0.0.1:11002${arr[0]}`, opts)
  .on('open', () => { opened = true; console.log('Lightning network connection opened') })
  .on('close', (...args) => { console.log('lightning closed'); ws.close() })
  .on('error', err => {
    try {
      throw new Error(err);
    } catch(error) {
      ws.send(err);
    }
  })
  .on('message', buf => { 
    let obj = JSON.parse(buf)
    console.log(obj);
    ws.send(JSON.stringify(obj))
  })

  ws.on('message', function(message) {
    const req = JSON.parse(message);
    console.log('Received from client: %s', req);
    const id = setInterval(() => {
      if(opened) {
        server.send(JSON.stringify(req))
        clearInterval(id);
      }
    }, 1000);
    
  });
});

console.log('Websocket Proxy server is running on port 5000');
console.log('Websocket Proxy server is running on port 5001');