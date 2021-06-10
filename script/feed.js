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
        var key = client.query(
            q.CreateIndex({
                name: 'key',
                source: q.Collection('posts'),
                terms: [{ field: ['data', 'key'] }]
            })
        )

        var auth = client.query(
            q.CreateIndex({
                name: 'author',
                source: q.Collection('posts'),
                terms: [{ field: ['data', 'value', 'author'] }]
            })
        )

        return Promise.all([key, auth])
    }
}

module.exports = createFeed