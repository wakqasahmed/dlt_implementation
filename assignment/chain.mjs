let blocks = []; // a chain of blocks
import redis from 'redis';
let dbClient = null;

const init = async function (currentPort) {
  this.dbClient = redis.createClient({
    port: 6379,
    host: 'localhost',
  });

  // const dbNumber = currentPort % 8000;

  // this.dbClient.select(dbNumber, function (err, res) {
  //   // check that the select was successful here
  //   if (err) return err;
  // });
};

const addBlock = function (block) {
  this.blocks.push(block);
};

export default { init, dbClient, blocks, addBlock };
