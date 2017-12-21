// Simple server for basic functionality
const express = require('express');
const app = express();
const sql = require('./lib/sql.js');
const bodyParser = require('body-parser');
const commands = require('./lib/sqlCommands.js');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Deposit tokens. Expects an event with args (see TrustedRelay.sol Deposit events)
app.post('/deposit', (req, res) => {
  console.log('deposit called', req.body)
  sql.run(req.body, commands.deposit)
  .then(() => {
    return sql.query(req.body.sig.m, commands.getDepositId)
  })
  .then((id) => { res.send({ status: 200, id: id[0].id }); })
  .catch((err) => { res.send({ status: 500, error: err }); })
})

app.post('/relay', (req, res) => {
  sql.query(req.body.hash, commands.getDepositId)
  .then((_id) => {
    const id = _id.length > 0 ? _id[0].id : '';
    req.body.depositId = id;
    return sql.run(req.body, commands.relay)
  })
  .then(() => { res.send({ status: 200, success: true }); })
  .catch((err) => { res.send({ status: 500, error: err }); })
})

// Get deposits (all or pending)
// {
//   user: <string>     // 0x prefixed address
//   pending: <bool>    // if true, only return pending deposits (no relay_id)
//   n: <string>        // (optional, default 100) max results returned
// }
app.get('/deposits', (req, res) => {
  sql.query(req.query, commands.getDeposits)
  .then((rows) => { res.send({ status: 200, result: rows }); })
  .catch((err) => { res.send({ status: 500, error: err }); })
})

// Get deposits (all or pending)
// {
//   user: <string>     // 0x prefixed address
//   pending: <bool>    // if true, only return pending deposits (no relay_id)
//   n: <string>        // (optional, default 100) max results returned
// }
// app.get('/relays', (req, res) => {
//   sql.query(req.query, commands.getRelays)
//   .then((rows) => { res.send({ status: 200, result: rows }); })
//   .catch((err) => { res.send({ status: 500, error: err }); })
// })

// Start server
const PORT = 3000;
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`)})
