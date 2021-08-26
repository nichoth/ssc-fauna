var faunadb = require('faunadb')
var createHash = require('crypto').createHash

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

function get (aboutWho) {
    return client.query(
        q.Get( q.Match(q.Index('avatar-by-id'), aboutWho) )
    )
}

// TODO --  we should take a message and verify that the signature is ok
// before we set the avatar

// either create or replace the existing avatar
function post (keys, file) {
    var hash = getHash(file)

    return client.query(
        q.If(
            q.IsEmpty(
                q.Match(q.Index('avatar-by-id'), '@' + keys.public)
            ),
            q.Create(
                q.Collection('avatar'),
                { data: { about: '@' + keys.public, avatarLink: hash } },
            ),
            q.Replace(
                q.Select('ref', q.Get(
                    q.Match(q.Index('avatar-by-id'), '@' + keys.public)
                )),
                { data: { about: '@' + keys.public, avatarLink: hash } },
            )
        )
    )
}

function getHash (file) {
    var hash = createHash('sha256')
    hash.update(file)
    return hash.digest('base64')
}

module.exports = {
    get,
    post
}

