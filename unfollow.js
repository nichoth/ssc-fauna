var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// @/BUNCQAxVmy3kGsOq7FFEnAiGYVmGQ/QlOjH9C4eonk=.ed25519

// keys needs to have { id, public }
function post (keys, msg) {
    try {
        var isValid = ssc.verifyObj(keys, null, msg)
    } catch (err) {
        console.log('not isvalid', isValid, err)
        return Promise.reject('invalid message')
    }

    // console.log('***msg***', msg)

    if (!isValid) {
        return Promise.reject('invalid message')
    }

    return client.query(
        q.Delete(
            q.Select(
                ["ref"],
                q.Get(
                    // need to find the `follow` msg with a given
                    // contact id
                    q.Match( q.Index('followed'), msg.content.contact )
                )
            )
        )
    )
        .then(res => {
            return {
                type: 'unfollow', 
                contact: res.data.value.content.contact
            }
        })

}

module.exports = { post }

