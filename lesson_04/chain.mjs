let blocks = []; // a chain of blocks

const init = function (args) {};

const addBlock = function (block) {
  blocks[blocks.length] = block;
};

export default { blocks, addBlock };
