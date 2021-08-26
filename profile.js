var faunadb = require('faunadb')
let cloudinary = require("cloudinary").v2;

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

function post (id, data) {
    return client.query(
        q.If(
            q.IsEmpty(
                q.Match(q.Index('profile-by-id'), id)
            ),
            q.Create(
                q.Collection('profiles'),
                { data: { ...data, about: id, author: id } },
            ),
            q.Replace(
                q.Select('ref', q.Get(
                    q.Match(q.Index('profile-by-id'), id)
                )),
                { data: { ...data, about: id, author: id } },
            )
        )
    )
}

module.exports = { get, post }
