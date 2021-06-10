require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// this is for setting your username
function createAbouts () {
    return client.query(
        q.CreateCollection({ name: 'abouts' })
    )
        .then((ret) => {
            createIndex()
        })
        .catch((err) => {
            console.error('oooooooo', err)
            createIndex()
        })

    function createIndex () {
        return client.query(
            q.CreateIndex({
                name: 'about-by-author',
                source: q.Collection('abouts'),
                terms: [{ field: ['data', 'value', 'author'] }],
            })
        )
    }
}

module.exports = createAbouts
