import peers from './peers';
import chain from './chain';
import util from './util';
import miner from './miner.mjs';
import state from './state.mjs';
import wallet from './wallet.mjs';

const processMessage = function (data) {
  const commandPrefix = data.message.toString().charAt(0);

  switch (commandPrefix) {
    case 'p':
      {
        peers.broadcastMessage(GET_PEERS());
      }
      break;
    case 'q':
      {
        peers.broadcastMessage(PEERS(data));
      }
      break;
    case 'a':
      {
        peers.activeNodes = 0;
        peers.broadcastMessage(GET_COUNT());
      }
      break;
    case 'c':
      {
        peers.broadcastMessage(COUNT(data));
      }
      break;
    case 'b':
      {
        // console.log('Getting block hashes');
        peers.broadcastMessage(GET_BLOCK_HASHES());
      }
      break;
    case 'h':
      {
        // console.log('Comparing network hashes with local blocks');
        peers.broadcastMessage(BLOCK_HASHES(data));
      }
      break;
    case 'r':
      {
        // console.log('Request block request received');
        peers.broadcastMessage(REQ_BLOCK(data));
      }
      break;
    case 'x':
      {
        // console.log('Received requested block');
        peers.broadcastMessage(BLOCK(data));
      }
      break;
    case 'z':
      {
        // console.log('Received new block');
        NEW_BLOCK(data);
      }
      break;
  }
};

// SBB Protocol
// ● Message structure:
//   ○ <STX><LEN><OPID><OBJ><ETX>
//   ○ Where:
//     ■ <STX>: ASCII CHARACTER 2
//     ■ <LEN>: 2 bytes which indicates the number of bytes in <OPID> + <OBJ>
//     ■ <OPID>: a single char/byte operation identifier
//     ■ <OBJ>: the operation’s payload object, which could be empty
//     ● Use JSON
//     ■ <ETX>: ASCII CHARACTER 3

const createMessage = function (message) {
  // Convert message from string to ascii (binary)
  // https://stackoverflow.com/questions/43932133/how-to-convert-to-ascii-using-node-js
  // const toAscii = (string) => string.split('').map(char=>char.charCodeAt(0)).join(" ")
  // console.log(toAscii("Hello, World"))
  // 72 101 108 108 111 44 32 87 111 114 108 100

  const encodedMessage = `${util.dec2bin(2)} ${
    message.length
  } ${message} ${util.dec2bin(3)}`;
  // console.log('encodedMessage after createMessage: ', encodedMessage);
  return encodedMessage;
};

/*
Initial Peer Discovery and getting their public keys
0.0) GET_PEERS message - return publicKey of this node and all other peers its connected to
   GET_PEERS - request publicKey of peers from neighbour
    ○ Respond with PEERS message
      ■ Contains public keys of peers
      
      Request:
      ● <OPID>: ‘p’
      ● <OBJ>: null/None/empty

      Response:
      ● <OPID>: ‘q’
      ● <OBJ>: {'peers': []}
*/
const GET_PEERS = function () {
  let _peers = peers.nodePublicKeys.map((p) => {
    return '"' + p + '"';
  });

  return `q {"peers": [${_peers}]}`;
};

/*
0.1) Upon receiving PEERS message - add peers publicKeys to an array (where missing)
   PEERS - contains the public keys of the neibouring peers
      ● <OPID>: ‘q’
      ● <OBJ>: {'peers': []}
*/
const PEERS = function (data) {
  const networkPeersResp = data.message.toString().split('{');

  let networkPeersJsonString = '{' + networkPeersResp[1];

  let networkPeersJson = JSON.parse(networkPeersJsonString);

  if (
    networkPeersJson.peers.length > peers.nodePublicKeys.length ||
    !networkPeersJson.peers.includes(wallet.publicKey)
  ) {
    peers.nodePublicKeys = [...peers.nodePublicKeys, ...networkPeersJson.peers];
    peers.nodePublicKeys = [...new Set(peers.nodePublicKeys)];

    return GET_PEERS();
  }

  return null;
};

/*
Whilst in <MINING> state Handle the Following Incoming Commands
*/

/*
1) GET_COUNT message - return number of blocks this node has
   GET_COUNT - request count from a neighbour
    ○ Respond with COUNT message
      ■ Contains number of blocks
      
      Request:
      ● <OPID>: ‘a’
      ● <OBJ>: null/None/empty

      Response:
      ● <OPID>: ‘c’
      ● <OBJ>: {'blocks': <X>}
*/
const GET_COUNT = function () {
  return `c {"blocks": ${chain.blocks.length}}`;
};

/*
2) Upon receiving COUNT message - process the known number of blocks a peer has
   COUNT - contains the number of blocks this node has
    ○ If peer has more blocks, then change to <Get Block Hashes> state
    ○ Send GET_BLOCK_HASHES message to receive hashes from peers

      ● <OPID>: ‘c’
      ● <OBJ>: {'blocks': <X>}
*/
const COUNT = function (data) {
  peers.activeNodes++;

  const networkBlockCountResp = data.message.toString().split('{');

  let blockCountJsonString = '{' + networkBlockCountResp[1];
  let blockCountJson = JSON.parse(blockCountJsonString);

  if (blockCountJson.blocks > chain.blocks.length) {
    state.networkBlockCount = blockCountJson.blocks;
    // console.log('need synchronization before starting mining');

    state.currentState = state.stateEnum.GET_BLOCK_HASHES;
    return `b`;
  } else {
    state.currentState = state.stateEnum.MINING;
    miner.run();
  }

  return null;
};

/*
3) GET_BLOCK_HASHES message - return all hashes of blocks this node has
   GET_BLOCK_HASHES - request list of all hashes    
  ○ Respond with BLOCK_HASHES message
    ■ Contains hashes of all blocks

    ● <OPID>: ‘b’
    ● <OBJ>: null/None/empty    

      Whilst in <Get Block Hashes> state, handle receiving of:
      ● BLOCK_HASHES message
        ○ Contains a peer’s hashes of all blocks
        ○ If they contain more, then:
          ■ Change to the <Get Blocks> state
          ■ Send a request for the 1st Block that we do not have in the chain of hashes received
            using the REQ_BLOCK message
      
        BLOCK_HASHES - contains all block hashes this peer has            
        ● <OPID>: ‘h’
        ● <OBJ>: {'hashes': [<hash1>, <hash2>, -- , <hashN>] }

      Whilst in <Get Block> state, handle receiving of:            
      ● BLOCK message
        BLOCK - contains a specific block
        ○ Contains a requested block
        ○ Validate the block
        ○ If the block can be added to the existing chain, than update the chain
        ○ Alternatively, create/update a temporary
        ○ If more blocks are pending to be requested from the hashes received:
          ■ then request the next one
          ■ Otherwise go back to the <Mining> state

          ● <OPID>: ‘x’
          ● <OBJ>: {'block': {
              ‘hash’: ‘<hash>’,
              ‘hashedContent’: {‘nonce’: <nonce>, ‘prev_hash’: ‘<ph>’,
              ‘timestamp:<tmstmp>’,
              ‘transactions’: [<tran1>, <tran2>, --- , <tranN>] }
              }
            }
          ● 'transactions':{
              'hash': '<hash>',
              'hashedContent': {
                'from_ac': '<from_ac>',
                'to_ac': '<to_ac>'
              }
            }            
*/

const GET_BLOCK_HASHES = function () {
  let hashes = chain.blocks.map((b) => {
    return '"' + b.hash + '"';
  });

  return `h {"hashes": [${hashes}]}`;
};

const BLOCK_HASHES = function (data) {
  //request block if more hashes are received

  const networkHashesResp = data.message.toString().split('{');

  let networkHashesJsonString = '{' + networkHashesResp[1];

  let networkHashesJson = JSON.parse(networkHashesJsonString);

  if (networkHashesJson.hashes.length > chain.blocks.length) {
    // console.log('need synchronization before starting mining.');
    // console.log('setting the state to get block.');

    state.currentState = state.stateEnum.GET_BLOCK;

    let localHashes = chain.blocks.map((b) => {
      return b.hash;
    });

    let difference = networkHashesJson.hashes.filter(
      (b) => !localHashes.includes(b)
    );

    if (difference.length > 0) {
      return `r {"hash": "${difference[0]}"}`;
    }
  }

  state.currentState = state.stateEnum.MINING;
  miner.init();
};

/*
4) REQ_BLOCK message - return a requested block
   REQ_BLOCK - request a specific block
      ● <OPID>: ‘r’
      ● <OBJ>: {'hash': '<hash>'}      
    ○ Respond with BLOCK message
        ■ Contains a specific block

      ● <OPID>: ‘x’
      ● <OBJ>: {'block': {
          ‘hash’: ‘<hash>’,
          ‘hashedContent’: {‘nonce’: <nonce>, ‘prev_hash’: ‘<ph>’,
          ‘timestamp:<tmstmp>’,
          ‘transactions’: [<tran1>, <tran2>, --- , <tranN>] }
          }
        }
      ● 'transactions':{
          'hash': '<hash>',
          'hashedContent': {
            'from_ac': '<from_ac>',
            'to_ac': '<to_ac>'
          }
        }
*/

const REQ_BLOCK = function (data) {
  const reqBlockResp = data.message.toString().split('{');

  let reqBlockJsonString = '{' + reqBlockResp[1];

  let reqBlockJson = JSON.parse(reqBlockJsonString);

  let block = chain.blocks.filter((b) => {
    return b.hash == reqBlockJson.hash;
  });

  if (block.length > 0) {
    return `x {"block": ${JSON.stringify(block[0])}}`;
  }
};

const BLOCK = function (data) {
  const blockResp = data.message.toString().substr(2);

  let blockJson = JSON.parse(blockResp);

  //TODO: validate block

  //TODO: add to the chain
  let block = chain.blocks.filter((b) => {
    return b.hash == blockJson.block.hash;
  });

  if (block.length == 0) {
    if (
      blockJson.block.hashedContent.prevHash == 0 ||
      (chain.blocks.length &&
        blockJson.block.hashedContent.prevHash ==
          chain.blocks[chain.blocks.length - 1].hash)
    ) {
      chain.addBlock(blockJson.block);
    } else {
      ("The new block's prevHash doesn't match with the last block's hash, ignoring it.");
    }
    // chain.blocks.push(blockJson.block);
  }

  //if state is get block, send request to get block hashes
  if (state.currentState == state.stateEnum.GET_BLOCK) {
    return `b`;
  }
};

/*
5) NEW_BLOCK message - receive and process a new block from another node
   NEW_BLOCK - contains a newly mined block
    ● <OPID>: ‘z’
    ● <OBJ>: {'block': {
          ‘hash’: ‘<hash>’,
          ‘hashedContent’: {
            ‘nonce’: <nonce>, 
            ‘prev_hash’: ‘<ph>’,
            ‘timestamp:<tmstmp>’,
            ‘transactions’: [<tran1>, <tran2>, --- , <tranN>]
          }
        }
      }
*/
const NEW_BLOCK = function (data) {
  BLOCK(data);
  // `z {"block": ${_block}`;

  // chain.blocks.push(_block.block);
  // return `z {'block': ${_block}`;
};

export default {
  processMessage,
  createMessage,
  NEW_BLOCK,
};
