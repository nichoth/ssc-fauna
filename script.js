var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

client.query(
  q.CreateIndex({
    name: 'avatar-by-id',
    source: q.Collection('avatar'),
    terms: [{ field: ['data', 'about'] }],
  })
)
    .then((ret) => console.log(ret))
    .catch((err) => console.error('Error: %s', err))

