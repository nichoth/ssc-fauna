var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// keys needs to have { id, public }
function post (keys, msg) {
    try {
        var isValid = ssc.verifyObj(keys, null, msg)
    } catch (err) {
        console.log('not isvalid', isValid, err)
        throw err
    }

    if (!isValid) {
        throw new Error('invalid message')
    }

    return client.query(
        q.Delete(
            // delete the invitation since it was used once now
            q.Select(
                ["ref"],
                q.Get(
                    q.Match( q.Index('invitation-by-code'), code )
                )
            )
        )
    )
        .then(res => res.data)

}

module.exports = { post }

