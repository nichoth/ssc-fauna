var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// this is for setting your username
function createAbouts () {
    return client.query(
        q.CreateCollection({ name: 'follow' })
    )
        .then((ret) => {
            createIndex()
        })
        .catch((err) => {
            console.error('oh no', err)
            createIndex()
        })


        // follow msgs are like
        // {
        // type: 'contact',
        // author: my-id,
        // contact: '@hxGxqPrplLjRG2vtjQL87abX4QKqeLgCwQpS730nNwE=.ed25519',
        // following: true 
        // }


    function createIndex () {
        return client.query(
            q.CreateIndex({
                name: 'following',
                source: q.Collection('follow'),
                terms: [{ field: ['data', 'value', 'author'] }]
            })
        )
    }
}

module.exports = createAbouts
