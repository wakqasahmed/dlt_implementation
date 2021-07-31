# DLT Implementation and Internals

### Assignment

#### Pre-requisites

Node >= 15.12.0

`npm install`

![Instructions Page1](https://user-images.githubusercontent.com/4486133/127739369-28363a53-21f8-4167-85a8-b12a899da771.png)
![Instructions Page2](https://user-images.githubusercontent.com/4486133/127739370-b765b286-39d7-4467-a4b9-7a30b87bae73.png)

![UML]()

#### TODO 01: SBB Completion

Open separate terminal for each of the given below:

- `node -r esm index.mjs 8001`
- `node -r esm index.mjs 8002`
- `node -r esm index.mjs 8003`
- `node -r esm index.mjs 8004`

Commands

- `b` or `balance` - _To check the node balance_
- `l` or `ledger` - _To check the list of all transactions executed so far_
- `s <receiverWalletAddress>` or `send <receiverWalletAddress>` e.g. `send ` - _To send 1 SBB token to another user_

![Output](https://user-images.githubusercontent.com/4486133/127739371-40a8916d-b587-4af8-98c5-0f6382477c42.png)

#### TODO 02: Configurable Blockchain
![Output](https://user-images.githubusercontent.com/4486133/127739374-b62ccc0d-360c-4454-b343-07618f846681.png)

#### TODO 03: BlockTime Calculation

- Difficulty: _4 zeros_
- Average Block Time: _1223 milliseconds_
- Test # of Blocks: _100_
- Maximum Nonce Limit: _50000000_ (to prevent infinite loop)
- Method: _stored each block mine time in an array and computed average_
  Please Note: `performance.now()` is used instead of typical `new Date().getTime()` for comparison, as suited better to measure performance according to !(this article)[https://developers.google.com/web/updates/2012/08/When-milliseconds-are-not-enough-performance-now]

```
$ node -r esm index.mjs 8001
Node Public Key:  04995cca93aa091a81409ce4d7e21c296959ce22edba86642e4125db851f7cf27908cf0f2cdcc524ce32d1f4c38b1651303c1c6f5fec495683b699d1acdd0e11a8
wallet.publicKey:  04995cca93aa091a81409ce4d7e21c296959ce22edba86642e4125db851f7cf27908cf0f2cdcc524ce32d1f4c38b1651303c1c6f5fec495683b699d1acdd0e11a8
{ address: '0.0.0.0', family: 'IPv4', port: 8001 }
server listening 0.0.0.0:8001
syncing in progress...
prompt>command> You are the first SBB miner, history is being written... The SBB genesis block
block# 1 found: 0000734a58a322096864ccb77008cd2f815ec630c2d56f1214640201ad0052db | time taken: 417.7852739095688ms | average block time: 417.7852739095688ms
block# 2 found: 000076e122cd3d14cd2606140d6acd824680082c3e84c0c2e4ec4521cd02fc6a | time taken: 3238.020353913307ms | average block time: 1827.902813911438ms
block# 3 found: 0000f9bd4dab0e344f5ad01cc07a6e0c91b32c5a114c08caa21e7b1116d89223 | time taken: 326.27406990528107ms | average block time: 1327.359899242719ms
block# 4 found: 0000e14a9c3016f7523f0e67f7d24b77836b2222e45b8a19fab7b328c3e1226a | time taken: 401.649307012558ms | average block time: 1095.9322511851788ms
block# 5 found: 0000dd83915aa170f0ddebc7b2a8a310437534bcd85442b0a91a4097426365d3 | time taken: 6.875347971916199ms | average block time: 878.1208705425263ms
.
.
.
block# 96 found: 0000ea79fba479a4567ed9efc21090fa075ced107d4cd14c0e370b8c617e35a0 | time taken: 839.1855989694595ms | average block time: 1236.1563069125016ms
block# 97 found: 00000e42f3506de9c3345be1e697801901e1214272953aa0adde2566318540e0 | time taken: 1649.7632240056992ms | average block time: 1240.420295748514ms
block# 98 found: 0000e95e93e25137a2451a41af2d814ffe3afa5c3165cdb451232cd4d8e20b32 | time taken: 367.73071002960205ms | average block time: 1231.515299975872ms
block# 99 found: 00006d0efff4708a6059c7f41e1cd620efd1c8ef4340927835211bcdfa1ea917 | time taken: 508.8213880062103ms | average block time: 1224.215361471128ms
block# 100 found: 0000582530f84bcaf32bf56f2a26a89145b8c243c5dc43117210fb11b431bf1a | time taken: 1118.7283039093018ms | average block time: 1223.1604908955096ms
```

- Difficulty: _5 zeros_
- Average Block Time: _22620 milliseconds_
- Test # of Blocks: _100_
- Maximum Nonce Limit: _50000000_ (to prevent infinite loop)
- Method: _stored each block mine time in an array and computed average_

```
$ node -r esm index.mjs 8001
Node Public Key:  049ca6a4defc2708dc3b1cd17412d517d1e3405e3aacc50f1249dc4f8823bd30210d4368720decfc32f6c46d658c685a4593ca5f2e7c033e65590c3cb89c4a943b
wallet.publicKey:  049ca6a4defc2708dc3b1cd17412d517d1e3405e3aacc50f1249dc4f8823bd30210d4368720decfc32f6c46d658c685a4593ca5f2e7c033e65590c3cb89c4a943b
{ address: '0.0.0.0', family: 'IPv4', port: 8001 }
server listening 0.0.0.0:8001
syncing in progress...
prompt>command> You are the first SBB miner, history is being written... The SBB genesis block
block# 1 found: 000003f522d093c5d12c197f18190408610f772baba5b612c8b4572b6ae27355 | time taken: 5974.994300961494ms | average block time: 5974.994300961494ms
block# 2 found: 00000a5ce377fe0561efee6d7972a4d01e23fb22fcc447fe60e7de1d2ad5940e | time taken: 3685.7001559734344ms | average block time: 4830.347228467464ms
block# 3 found: 00000358f45998edb65d32f4cfcbac2a65e8fb0a01ae1f39c0dffcd845f2ddec | time taken: 12747.79771900177ms | average block time: 7469.4973919789ms
block# 4 found: 000007306ec85f52e70a2cc7a7ab469f33c45f3d041ce2a9e77d9c1e8ff59727 | time taken: 1822.564227938652ms | average block time: 6057.764100968838ms
block# 5 found: 00000ae9463bc75044f52b2324ce9ef4dda3c191eec247a5490cecf0b06adb73 | time taken: 27306.965486049652ms | average block time: 10307.604377985ms
.
.
.
block# 96 found: 000002e3fc320e072a10a0cddb291136876d7cb3a7605bca1e0cf211a074b13f | time taken: 17598.125045895576ms | average block time: 22803.48438367496ms
block# 97 found: 0000005f652eecd55a94c7a3a472dba3040416d8f16e61cd7651c03210c6bfdf | time taken: 11692.683795928955ms | average block time: 22688.940047718814ms
block# 98 found: 000004e1c281397bf5cc97327f56cc27002f8ee10e5d093e4d6ff860d5f0efd3 | time taken: 14165.0240598917ms | average block time: 22601.96131314915ms
block# 99 found: 000001c2955aeef1cffd4fbd75255dcf29738d32459729bb65fd331f80b5ef49 | time taken: 15955.567401051521ms | average block time: 22534.82602110776ms
block# 100 found: 0000061c267eac786b8955cdcd0d6c9e8af266c110a7ff9984572598b347974e | time taken: 31129.543534994125ms | average block time: 22620.773196246624ms
```

_Bitcoin Difficulty Calculation Formula_
https://medium.facilelogin.com/the-mystery-behind-block-time-63351e35603a

```
new_difficulty = old_difficulty X (2016 blocks X 10 minutes) / (the time took in minutes to mine the last 2016 blocks)

*SBB Difficulty Calculation Formula*

new_difficulty = old_difficulty X (100 blocks X 10000 ms) / (the time took in ms to mine the last 100 blocks)

Genesis difficulty = 1
100 blocks = 110ms
Average Block Time = 1.10 milliseconds
new_difficulty = 1 * (100 * 10000 ) / (110 * 100) = 91

Genesis difficulty = 2
100 blocks = 692ms
Average Block Time = 6.92 milliseconds
new_difficulty = 2 * (100 * 10000 ) / (692 * 100) = 28.90

Genesis difficulty = 3
100 blocks = 8224ms
Average Block Time = 82.24 milliseconds
new_difficulty = 3 * (100 * 10000 ) / (8224 * 100) = 3.65

Genesis difficulty = 4
100 blocks = 122300ms
Average Block Time = 1223 milliseconds
new_difficulty = 4 * (100 * 10000) / (122300 * 100) = 0.33

Genesis difficulty = 5
100 blocks = 2262000ms
Average Block Time = 22620 milliseconds
new_difficulty = 5 * (100 * 10000 ) / (2262000 * 100) = 0.02
```

#### TODO: 05 Account Model DB

![Output](https://user-images.githubusercontent.com/4486133/127739378-98c45cb2-8280-4319-a8ad-079d3037f44e.png)

##### Setup Redis

```
$ brew update
$ brew install redis
$ brew services start redis
$ redis-cli ping
$ redis-cli
redis> set foo bar
OK
redis> get foo
"bar"
```

https://developer.redislabs.com/create/homebrew/

https://developer.redislabs.com/develop/node/gettingstarted

#### TODO: 06 UTXO Model

#### TODO: 07 Well-defined Byte Encoding

#### TODO: 08 Evaluation

#### TODO: 09 Report
