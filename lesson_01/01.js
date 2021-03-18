let nodes = [];
let timer = 0;
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const args = process.argv.slice(2);
let node = {
  ip: null,
  port: null
};
let currentNode = {
  ip: null,
  port: null
};

const util = require('./util'); 

const init = function(args) {

  server.on('listening', () => {
    const address = server.address();

    console.log(address);
    currentNode = {
      ip: address.address,
      port: address.port
    }
    loadSeedNodes();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

  server.bind(args[0]);
  // Prints: server listening 0.0.0.0:41234

  scheduleNextMessage();
}

const loadSeedNodes = function() {
    const currentPort = currentNode.port.toString();
    for(let i=1; i<10; i++){
      nodes.push({
        ip: currentNode.ip,
        port: currentPort.substring(0,currentPort.length-1) + i
      });
    }
}

const broadcastMessage = function(data) {
  nodes.forEach(node => {
    if(node.port != currentNode.port){
      server.send(data,node.port,node.ip,()=>{
        // console.log(`Message ${data} sent to ${node.ip}:${node.port}`)
      })
    }
  });
  // console.log("Message broadcasted successfully.")

  scheduleNextMessage();
}

const scheduleNextMessage = function() {
  timer = setInterval(() => {
    broadcastMessage("test");
  }, util.getRandomIntInclusive(500,5000));
}

const processIncomingMessage = function(data, ip, port) {
  console.log("Message [" + data + "] from [" + ip + "]:[" + port + "]" + "\n");
}

if(!args || isNaN(args[0])){
  console.log(`command syntax: node 01.js 8001`);
  return;
}

init(args);

server.on('message', (msg, rinfo) => {
  processIncomingMessage(msg, rinfo.address, rinfo.port)
  // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});





