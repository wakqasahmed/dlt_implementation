# DLT Implementation and Internals Step-by-Step

## Pre-requisites

`Node v12.16.3` or greater

`Node >= 15.12.0` recommended

## Setup

`git clone https://github.com/wakqasahmed/dlt_implementation.git`

`cd dlt_implementation`

### Lesson 01 - Worst Blockchain Ever - Broadcasting

#### Time taken: about 2.5 hrs

[Specifications](./lesson_01/README.md)

Open separate terminal for each of the given below:

- `node ./lesson_01/01.js 8001` or `node ./lesson_01/02.js 8001`
- `node ./lesson_01/01.js 8002` or `node ./lesson_01/02.js 8002`
- `node ./lesson_01/01.js 8003` or `node ./lesson_01/02.js 8003`

### Lesson 02 - Worst Blockchain Ever - State Management

#### Time taken: about 24 hrs

[Specifications](./lesson_02/README.md)

Open separate terminal for each of the given below:

- `node -r esm index.mjs 8001 wa`
- `node -r esm index.mjs 8002 ok`
- `node -r esm index.mjs 8003 je`

Commands

- `balance` - _To check the node balance_
- `ledger` - _To check the list of all transactions executed so far_
- `send <userIntitials>` e.g. `send wa` - _To send 1 WBE token to another user_

### Lesson 03 - Worst Blockchain Ever - Execution Engine

#### Time taken: about 2.5 hrs

[Specifications](./lesson_03/README.md)

Open separate terminal for each of the given below:

- `node -r esm index.mjs 8001 wa`
- `node -r esm index.mjs 8002 ok`
- `node -r esm index.mjs 8003 je`

Commands

- `balance` - _To check the node balance_
- `ledger` - _To check the list of all transactions executed so far_
- `send <userIntitials>` e.g. `send wa` - _To send 1 WBE token to another user_
- `pending` - _To check the list of all pending transactions, waiting for recipient to approve_
- `approve <txnNumber>` e.g. `approve 20` _To approve transaction requiring recipient approval_
