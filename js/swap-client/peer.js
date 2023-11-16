const Peer = require('@portaldefi/peer');

let peer;

const core = async () => {
    peer = await new Peer({
        id: 'portal',
        hostname: '127.0.0.1',
        port: 18080
    })
    .on('log', log => console.log(log))
    .start();
}

process.on('exit', () => {
    console.log(exit);
    peer.stop();
})

core();
