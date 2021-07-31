import peers from './peers';
import chain from './chain';
import util from './util';
import miner from './miner.mjs';
import state from './state.mjs';
import block from './block.mjs';

const processMessage = function (data) {
  // console.log('Before getting charAt: ', data.message.toString());
  const commandPrefix = data.message.toString().charAt(0);

  switch (commandPrefix) {
    case 'a':
      {
        peers.activeNodes = 0;
        peers.broadcastMessage(GET_COUNT());
      }
      break;
    case 'c':
      {
        peers.broadcastMessage(COUNT(data));

        /*
        peers.activeNodes++;
        console.log('Data Message:', data.message);
        const networkBlockCountResp = data.message.toString().split('{');

        let blockCountJsonString = '{' + networkBlockCountResp[1];
        let blockCountJson = JSON.parse(blockCountJsonString);

        if (blockCountJson.blocks > chain.blocks.length) {
          console.log('need synchronization before starting mining');
          // miner.isSynchronized = false;
        } else if (!miner.isMining) {
          // miner.isSynchronized = true;
          //miner.init();
        }
        // }
        */
      }
      break;
    case 'b':
      {
        console.log('Getting block hashes');
        peers.broadcastMessage(GET_BLOCK_HASHES());
      }
      break;
    case 'h':
      {
        console.log('Comparing network hashes with local blocks');
        peers.broadcastMessage(BLOCK_HASHES(data));
      }
      break;
    case 'r':
      {
        console.log('Request block request received');
        peers.broadcastMessage(REQ_BLOCK(data));
      }
      break;
    case 'x':
      {
        console.log('Received requested block');
        peers.broadcastMessage(BLOCK(data));
      }
      break;
    case 'z':
      {
        console.log('Received new block');
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
  const encodedMessage = `${util.dec2bin(2)} ${
    message.length
  } ${message} ${util.dec2bin(3)}`;
  console.log('encodedMessage after createMessage: ', encodedMessage);
  return encodedMessage;
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
  console.log('Data Message:', data.message);
  const networkBlockCountResp = data.message.toString().split('{');

  let blockCountJsonString = '{' + networkBlockCountResp[1];
  let blockCountJson = JSON.parse(blockCountJsonString);

  if (blockCountJson.blocks > chain.blocks.length) {
    state.networkBlockCount = blockCountJson.blocks;
    console.log('need synchronization before starting mining');
    // miner.isSynchronized = false;
    state.currentState = state.stateEnum.GET_BLOCK_HASHES;
    return `b`;
  } else {
    state.currentState = state.stateEnum.MINING;
    miner.run();
  }
  // } else if (!miner.isMining) {
  // miner.isSynchronized = true;
  //miner.init();
  // }

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

  // let hashes = [];
  // chain.blocks.forEach((block) => {
  //   hashes.push("'" + block.hash + "'");
  // });

  // console.log('HASHES after extraction: ', hashes);
  return `h {"hashes": [${hashes}]}`;

  // return "h {'hashes': [" + hashes + ']}';
};

const BLOCK_HASHES = function (data) {
  //request block if more hashes are received

  console.log('Data Message from BLOCK_HASHES:', data.message);
  const networkHashesResp = data.message.toString().split('{');

  // let networkHashesJsonString = JSON.stringify('{' + networkHashesResp[1]);
  let networkHashesJsonString = '{' + networkHashesResp[1];
  console.log('networkHashesJsonString: ', networkHashesJsonString);

  let networkHashesJson = JSON.parse(networkHashesJsonString);
  console.log('networkHashesJson: ', networkHashesJson);

  // networkHashesJson.hashes.map((h) => {
  //   console.log('Hash: ', h);
  // });

  // console.log('networkHashesJson Hashhhhheeesss: ', networkHashesJson.hashes);

  if (networkHashesJson.hashes.length > chain.blocks.length) {
    console.log('need synchronization before starting mining');
    // miner.isSynchronized = false;
    state.currentState = state.stateEnum.GET_BLOCK;

    let localHashes = chain.blocks.map((b) => {
      return b.hash;
    });

    console.log('local HASHES: ', localHashes);
    console.log('network HASHES: ', networkHashesJson.hashes);

    let difference = networkHashesJson.hashes.filter(
      (b) => !localHashes.includes(b)
    );

    console.log('Difference: ', difference);
    console.log(
      'Local chain: ',
      chain.blocks.map((b) => b)
    );

    if (difference.length > 0) {
      return `r {"hash": "${difference[0]}"}`;
    }
    // for(let i=0;i<networkHashesJson.length;i++){

    // }

    //return `b`;
  }

  // if(hashes received > chain.blocks.length)
  state.currentState = state.stateEnum.MINING;
  // block.init();
  // miner.run();
  miner.init();

  // console.log('Block HASHES: ', data.message);

  // return `r {'hash': ${_hash}`;
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
  console.log('Data Message from REQ_BLOCK:', data.message);
  const reqBlockResp = data.message.toString().split('{');

  // let networkHashesJsonString = JSON.stringify('{' + networkHashesResp[1]);
  let reqBlockJsonString = '{' + reqBlockResp[1];
  console.log('reqBlockJsonString: ', reqBlockJsonString);

  let reqBlockJson = JSON.parse(reqBlockJsonString);
  console.log('reqBlockJson: ', reqBlockJson);

  let block = chain.blocks.filter((b) => {
    return b.hash == reqBlockJson.hash;
  });

  if (block.length > 0) {
    console.log('Block found at Req_block: ', block[0]);
    return `x {"block": ${JSON.stringify(block[0])}}`;
    // return 'x {"block": ' + block[0] + '}';
  }
};

const BLOCK = function (data) {
  console.log('Data Message from BLOCK:', data.message);
  // const blockResp = data.message.toString().split('{');
  const blockResp = data.message.toString().substr(2);

  // let blockJsonString = '{' + blockResp[1];
  // console.log('blockJsonString: ', blockJsonString.block);

  let blockJson = JSON.parse(blockResp);
  console.log('blockJson: ', blockJson);

  console.log('Block found to be validated: ', blockJson.block);

  //TODO: validate block

  //TODO: add to the chain
  let block = chain.blocks.filter((b) => {
    return b.hash == blockJson.block.hash;
  });

  if (block.length == 0) {
    console.log('Block not found in existing chain, adding it...');
    chain.blocks.push(blockJson.block);
  } else {
    console.log('Block found in existing chain, skipping it...', block);
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
