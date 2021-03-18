let timer = 0;
const args = process.argv.slice(2);

const util = require('./util'); 
const peers = require('./peers'); 

if(!args || isNaN(args[0])){
  console.log(`command syntax: node 01.js 8001`);
  return;
}

const init = async function(user_args) {
  await peers.initPeers(user_args);
  scheduleNextMessage();
}

const scheduleNextMessage = function() {
  timer = setInterval(() => {
    peers.broadcastMessage("test");
  }, util.getRandomIntInclusive(500,5000));
}

init(args);



