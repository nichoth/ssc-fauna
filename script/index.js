require('dotenv').config()
var faunadb = require('faunadb')

var q = faunadb.query
var sec = (process.env.BRANCH ==='test' || process.env.NODE_ENV === 'test') ?
    process.env.FAUNADB_SERVER_SECRET_TEST :
    process.env.FAUNADB_SERVER_SECRET

var client = new faunadb.Client({
    secret: sec,
    // domain: 'db.us.fauna.com'
})

console.log('node env', process.env.NODE_ENV)
console.log('secret', process.env.FAUNADB_SERVER_SECRET_TEST)
console.log('sec', sec)

// this will create the necessary collections and indices for the
// DB defined by the env variable FAUNADB_SERVER_SECRET or
// FAUNADB_SERVER_SECRET_TEST

var collections = [
    // [ collectionName, index ]
    ['posts', [{
            name: 'post-by-author',
            source: q.Collection('posts'),
            terms: [ { field: ['data', 'value', 'author'] } ]
        },
        {
            name: 'post-by-key',
            source: q.Collection('posts'),
            terms: [{ field: ['data', 'key'] }]
        }]
    ],
    // ['abouts'],  // replaced by `profile`

    // TODO -- put the indexes in here
    ['profiles', [{
            name: 'profile-by-id',
            source: q.Collection('profiles'),
            terms: [ { field: ['data', 'value', 'content', 'about'] } ],
        },
        {
            name: 'profile-by-name',
            source: q.Collection('profiles'),
            terms: [{ field: ['data', 'name'] }]
        }]
    ],

    ['invitations'],
    ['server-following', [
        {
            name: 'server-following-who',
            source: q.Collection('server-following'),
            terms: [ { field: ['data', 'contact'] } ]
        }
    ]],

    ['follow', [
        {
            name: 'following',
            source: q.Collection('follow'),
            terms: [{ field: ['data', 'value', 'author'] }]
        }
    ]]
]

Promise.all(collections.map(([name, indexes]) => {
    return client.query(
        q.If(
            q.Exists(q.Collection(name)),
            name + ' exists',
            // q.Do(
                // this doesn't work b/c of the cache
            //     q.Delete(q.Collection(name)),
            //     q.CreateCollection({ name })
            // ),
            q.CreateCollection({ name })
        )
    )
        .then((res) => {
            // @TODO -- every collection should have an index
            if (!indexes) return ('collection -- ' + res +
                ', no index')

            return Promise.all(indexes.map(index => {
                return client.query(
                    q.If(
                        q.Exists(q.Index(index.name)),
                        'collection -- ' + res +
                            ', index -- ' + index.name + ' exists',
                        q.CreateIndex(index)
                    )
                )
            }))

        })
}))
    .then((res) => {
        console.log('created collections', res)
    })
    .catch(err => console.log('errr', err))
