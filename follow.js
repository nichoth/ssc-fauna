var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// see who you are following

// follow msgs are like
// {
// type: 'contact',
// author: my-id,
// contact: '@hxGxqPrplLjRG2vtjQL87abX4QKqeLgCwQpS730nNwE=.ed25519',
// following: true 
// }

function get (author) {
    return client.query(
        q.Map(
            q.Paginate(
                q.Reverse( q.Match(q.Index('following'), author) )
            ),
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
        )
    )
        .then(res => {
            return res.data.map(res => {
                return res.data
            })
        })
}

async function post (author, keys, msg) {
    try {
        var lastFollowMsg = await client.query(
            q.Get(
                q.Match(q.Index('following'), author)
            )
        );
    } catch (err) {
        if (err.message === 'instance not found') {
            // this means it's a new string of 'follow' msgs
            // and there is no ancestor
            // console.log('~~~~~ not found ~~~~~')
            var lastFollowMsg = null
        } else {
            throw err
        }
    }

    try {
        var isValid = ssc.verifyObj(keys, lastFollowMsg || null, msg)
    } catch (err) {
        console.log('not isvalid', isValid, err)
        throw err
    }

    if (!isValid) {
        throw new Error('invalid message')
    }

    // write a new 'follow' msg
    var msgHash = ssc.getId(msg)
    return client.query(
        q.Create(q.Collection('follow'), {
            data: { value: msg, key: msgHash }
        })
    )
        .then(res => res.data)

}

module.exports = { post, get }
