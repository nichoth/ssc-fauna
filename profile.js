var faunadb = require('faunadb')
let cloudinary = require("cloudinary").v2
var upload = require('./upload')
var createHash = require('crypto').createHash
var ssc = require('@nichoth/ssc')
var xtend = require('xtend')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

function get (id) {
    return client.query(
        q.Get(q.Match(q.Index('profile-by-id'), id))
    )
        .then(doc => {
            return xtend(doc.data, {
                value: xtend(doc.data.value, {
                    content: xtend(doc.data.value.content, {
                        avatar: doc.data.value.content.avatar || null
                    })
                })
            })
        })
}

function post (id, file, msg) {

    return get(id)
        // extend the existing profile
        .then(() => {
            if (file) {
                // @TODO -- check if the hash matches with the hash in
                //   the msg
                var hash = getHash(file)

                return Promise.all([
                    upload(file, hash),
                    writeToDB(id, msg)
                ])
                    .then(res => res[1])
            }

            return writeToDB(id, msg)
        })
        .catch(err => {
            if (err.toString().includes('instance not found')) {
                // is a new profile, need to write it
                return writeToDB(id, msg)
            }
            throw err
        })
}

function writeToDB (id, msg) {
    var key = ssc.getId(msg)

    // console.log('**msg**', msg)

    return client.query(
        q.If(
            q.IsEmpty(
                q.Match(q.Index('profile-by-id'), id)
            ),
            q.Create(
                q.Collection('profiles'),
                { data: { key: key, value: msg } },
            ),
            q.Replace(
                q.Select('ref', q.Get(
                    q.Match(q.Index('profile-by-id'), id)
                )),
                { data: { key: key, value: msg } }
            )
        )
    )
        .then(res => {
            return res.data || res
        })
}

function getHash (file) {
    var hash = createHash('sha256')
    hash.update(file)
    return hash.digest('base64')
}

module.exports = { get, post }
