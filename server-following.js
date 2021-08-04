var faunadb = require('faunadb')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// pass in the id
function get (who) {

    return client.query(
        q.Get( q.Match(q.Index('server-following-who'), who) )
    )

}

module.exports = {
    get
}
