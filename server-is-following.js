var faunadb = require('faunadb')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

function isFollowing (id) {
    return client.query(
        q.Get( q.Match(q.Index('server-following-who'), id) )
    )
        .then((res) => {
            return true
        })
        // we are not following them
        .catch(() => false)
}

module.exports = isFollowing
