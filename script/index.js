require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

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
    )
])
.then(() => {
    require('./abouts')()
    require('./avatar')()
})
.catch((err) => console.error('aaaaaaaa: %s', err))



// client.query(
//     q.Delete( q.Collection('abouts') )
// )
//     .then((ret) => {
//         console.log('del', ret)
//         delAvatar()
//     })
//     .catch((err) => console.error('Error: %s', err))

// function delAvatar () {
//     client.query(
//         q.Delete( q.Ref(q.Collection('avatar')) )
//     )
//         .then((ret) => {
//             console.log('del', ret)
//             require('./abouts')()
//             require('./avatar')()
//         })
//         .catch((err) => console.error('Error: %s', err))
// }

