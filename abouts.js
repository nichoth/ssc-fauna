var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// for setting and getting your user name

function getByName (name) {
    return client.query(
        q.Map(
            q.Paginate(
                q.Match(q.Index('about-by-name'), name)
            ),
            q.Lambda( 'aboutMsg', q.Get(q.Var('aboutMsg')) )
        )
    )
        .then(res => res.data.map(r => {
            return r.data
        }))
}

async function get (author) {
    try {
        var lastAboutMsg = await client.query(
            q.Get(
                q.Match(q.Index('about-by-author'), author)
            )
        )
    } catch (err) {
        if (err.message === 'instance not found') {
            // this means it's a new string of 'about' msgs
            // and there is no ancestor
            // console.log('~~~~~ not found ~~~~~')
            var lastAboutMsg = null
        } else {
            throw err
        }
    }

    return lastAboutMsg ? lastAboutMsg.data : lastAboutMsg
}

// for setting your user name
async function post (keys, msg) {

    // get an existing about feed
    // to check if the merkle list matches up
    try {
        var lastAboutMsg = await client.query(
            q.Get(
                q.Match(q.Index('about-by-author'), '@' + keys.public)
            )
        );
    } catch (err) {
        if (err.message === 'instance not found') {
            // this means it's a new string of 'about' msgs
            // and there is no ancestor
            var lastAboutMsg = null
        } else {
            throw err
        }
    }

    // console.log('last about', lastAboutMsg)
    // console.log('keys, msg', keys, msg)

    try {
        var isValid = ssc.verifyObj(keys, lastAboutMsg || null, msg)
    } catch (err) {
        console.log('not isvalid', isValid, err)
        throw err
    }

    if (!isValid) {
        console.log('not valid', isValid)
        throw new Error('invalid message')
    }

    // write a new 'about' msg
    var msgHash = ssc.getId(msg)
    return client.query(
        q.Create(q.Collection('abouts'), {
            data: { value: msg, key: msgHash }
        })
    )
        .then(res => res.data)
}

module.exports = { get, post, getByName }
