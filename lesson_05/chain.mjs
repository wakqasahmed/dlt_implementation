let blocks = []; // a chain of blocks

const init = function (args) {};

const addBlock = function (block) {
  // blocks[blocks.length] = block;
  // console.log('Adding to chain: ', block);
  this.blocks.push(block);
  // console.log('Chain after new block added: ', this.blocks);
};

export default { blocks, addBlock };
