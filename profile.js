var faunadb = require('faunadb')
let cloudinary = require("cloudinary").v2
var upload = require('./upload')
var createHash = require('crypto').createHash
var ssc = require('@nichoth/ssc')

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
            return doc.data
        })
}

function post (id, file, msg) {
    if (file) {
        // @TODO -- check if the hashes match with in the msg
        var hash = getHash(file)

        return Promise.all([
            upload(file, hash),
            writeToDB(id, msg)
        ])
            .then(res => res[1])
    }

    return writeToDB(id, msg)
}

function writeToDB (id, msg) {
    var key = ssc.getId(msg)

    return client.query(
        q.If(
            q.IsEmpty(
                q.Match(q.Index('profile-by-id'), id)
            ),
            q.Create(
                q.Collection('profiles'),
                { data: { key: key, ...msg, author: id, about: id } },
            ),
            q.Replace(
                q.Select('ref', q.Get(
                    q.Match(q.Index('profile-by-id'), id)
                )),
                { data: msg }
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
