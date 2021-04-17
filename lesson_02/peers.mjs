let nodes = [];
let timer = 0;
import { createSocket } from 'dgram';
const server = createSocket('udp4');
let currentNode = {
  ip: null,
  port: null,
};

import state from './state';
import protocol from './protocol';
import util from './util';

const initPeers = function (args) {
  server.on('listening', () => {
    const address = server.address();

    console.log(address);
    currentNode = {
      ip: address.address,
      port: address.port,
    };
    loadSeedNodes();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

  state.userInitials = args[1];
  console.log('args[1]: ', args[1]);
  console.log('state.userInitials: ', state.userInitials);
  server.bind(args[0]);
  // Prints: server listening 0.0.0.0:41234
};

const loadSeedNodes = function () {
  const currentPort = currentNode.port.toString();
  for (let i = 1; i < 10; i++) {
    nodes.push({
      ip: currentNode.ip,
      port: currentPort.substring(0, currentPort.length - 1) + i,
    });
  }
};

const broadcastMessage = function (data) {
  // console.log(`About to broadcast message: ${data}`);

  const cmd = protocol.createMessage(data);

  // console.log(`Broadcasted: `, cmd);

  nodes.forEach((node) => {
    if (node.port != currentNode.port) {
      server.send(cmd, node.port, node.ip, () => {
        // console.log(`Message ${data} sent to ${node.ip}:${node.port}`);
      });
    }
  });
  // console.log('Message broadcasted successfully.');
};

const processIncomingMessage = function (encodedMessage, ip, port) {
  //decipher command and act accordingly

  // console.log('encodedMessage: ', encodedMessage);
  const splittedMsg = encodedMessage.split(' ');

  const stx = `${util.bin2dec(splittedMsg[0])}`;
  const len = `${splittedMsg[1]}`;
  const cmd = splittedMsg
    .map((element, index) => {
      if (index > 1 && index < splittedMsg.length - 1) {
        return element;
      }
    })
    .filter((element) => element !== undefined)
    .join(' ');
  // console.log('cmd: ', cmd);
  const etx = `${util.bin2dec(splittedMsg.length)}`;

  const data = cmd.trim();

  protocol.processMessage({
    message: data,
    ip: ip,
    port: port,
  });
  /*
  console.log(
    'Message [' +
      data +
      '] from [' +
      ip +
      ']:[' +
      port +
      ']' +
      '\n'
  );
*/
};

server.on('message', (msg, rinfo) => {
  // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  processIncomingMessage(`${msg}`, rinfo.address, rinfo.port);
});

export default { currentNode, initPeers, broadcastMessage };
