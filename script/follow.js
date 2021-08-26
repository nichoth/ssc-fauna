require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

if (require.main === module) {
    createFollow()
}

// this is for setting your username
function createFollow () {
    return client.query(
        q.If(
            q.Exists(
                q.Collection('follow')
            ),
            'Collection exists',
            q.CreateCollection({ name: 'follow' })
        )
    )
        .then((ret) => {
            console.log('aaaa', ret)
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
            q.If(
                q.Exists(q.Index('following')),
                'Index exists',
                q.CreateIndex({
                    name: 'following',
                    source: q.Collection('follow'),
                    terms: [{ field: ['data', 'value', 'author'] }]
                })
            )
        )
            .then(res => {
                console.log('ressss', res)
            })
            .catch(err => {
                console.log('errrrr', err)
            })
    }
}

module.exports = createFollow
