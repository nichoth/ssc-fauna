var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

function createFeed () {
    return client.query(
        q.CreateCollection({ name: 'posts' })
    )
        .then((ret) => {
            return createIndex()
        })
        .catch((err) => console.error('Error: %s', err))

    function createIndex () {
        return client.query(
            q.CreateIndex({
                name: 'author',
                source: q.Collection('posts'),
                terms: [{ field: ['data'] }],
            })
        )
    }
}

module.exports = createFeed