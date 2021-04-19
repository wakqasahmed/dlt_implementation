# DLT Implementation and Internals Step-by-Step

### Lesson 03

#### Pre-requisites

Node >= 15.12.0

`npm install`

#### TODO 04

![Instructions]()

![UML]()

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

![Output]()
