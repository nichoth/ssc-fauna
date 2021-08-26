require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// delete existing collections
Promise.all([
    client.query(
        q.If(q.Exists( q.Collection('abouts') ), 
            q.Delete( q.Collection('abouts') ),
            'was false'
        )
    ),
    client.query(
        q.If(q.Exists( q.Collection('avatar') ), 
            q.Delete( q.Collection('avatar') ),
            'was false'
        )
    ),
    client.query(
        q.If(q.Exists( q.Collection('posts') ), 
            q.Delete( q.Collection('posts') ),
            'was false'
        )
    )
])
    .then(() => {
        require('./abouts')()
        require('./avatar')()
        require('./feed')()
        require('./follow')()
        require('./profile')()
    })
    .catch((err) => console.error('aaaaaaaa: %s', err))
