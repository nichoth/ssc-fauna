require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

if (require.main === module) {
    createProfiles()
}

function createProfiles () {
    return client.query(
        q.If(
            q.Exists(
                q.Collection('profiles')
            ),
            'Collection exists',
            q.CreateCollection({ name: 'profiles' })
        ),
    )
        .then(() => createIndex())
        .then(res => {
            console.log('resssssss', res)
        })
        .catch((err) => {
            console.error('oooooooo', err)
            createIndex()
        })

    function createIndex () {
        return Promise.all([
            client.query(
                q.If(
                    q.Exists(
                        q.Index('profile-by-id')
                    ),
                    'Index exists',
                    q.CreateIndex({
                        name: 'profile-by-id',
                        source: q.Collection('profiles'),
                        terms: [{ field: ['data', 'value', 'author'] }],
                    })
                )
            ),

            client.query(
                q.If(
                    q.Exists(
                        q.Index('profile-by-name')
                    ),
                    'Index exists',
                    q.CreateIndex({
                        name: 'profile-by-name',
                        source: q.Collection('profiles'),
                        terms: [{ field: ['data', 'value', 'name'] }]
                    })
                )
            )
        ])
    }
}

module.exports = createProfiles

