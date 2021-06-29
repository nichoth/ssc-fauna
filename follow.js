var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')
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

// see who you are following

// follow msgs are like
// {
// type: 'contact',
// author: my-id,
// contact: '@hxGxqPrplLjRG2vtjQL87abX4QKqeLgCwQpS730nNwE=.ed25519',
// following: true 
// }

function get (author) {
    return getFollowed(author)
        .then(followed => {
            var _followed = followed.map(res => {
                return res.data.value.content.contact
            })
            return Promise.all([
                Promise.resolve(_followed),
                getAvatars(_followed),
                getNames(_followed)
            ])
        })
        .then(([followed, avas, names]) => {
            var fols = followed.reduce((acc, id, i) => {

                var slugslug = null
                var ava = (avas && avas[i] && avas[i][0]) ?
                    avas[i][0].data :
                    null
                if (ava && ava.avatarLink) {
                    var slugifiedHash = encodeURIComponent('' + ava.avatarLink)
                    slugslug = encodeURIComponent(slugifiedHash)
                }

                acc[id] = {
                    id: id,
                    avatarUrl: cloudinary.url(slugslug),
                    avatar: ava,
                    name: (names && names[i]) ?
                        (names[i] && names[i][0] &&
                            names[i][0].data.value.content.name) :
                        null
                }
                return acc
            }, {})

            return fols
        })
}

function getFollowed (author) {
    return client.query(
        q.Map(
            q.Paginate(
                q.Match(q.Index('following'), author)
            ),
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
        )
    )
        .then(res => res.data)
}

function getAvatars (followed) {

    return client.query(
        q.Map(
            // followed,
            followed,
            q.Lambda(
                'id',
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('avatar-by-id'), q.Var('id')),
                    ),
                    q.Lambda('msg', q.Get(q.Var('msg')))
                )
            )
        )
    )
        .then(res => {
            var _res = res.map(doc => doc.data)
            return _res
        })
        .catch(err => {
            console.log('***ava errrrrrr', err)
        })
}

function getNames (followed) {
    return client.query(
        q.Map(
            followed,
            q.Lambda(
                'id',
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('about-by-author'), q.Var('id')),
                    ),
                    q.Lambda('msg', q.Get(q.Var('msg')))
                )
            )
        )
    )
        .then(res => {
            var _res = res.map(doc => doc.data)
            return _res
        })
        .catch(err => {
            console.log('***name errrrrrr', err)
        })
}

async function post (author, keys, msg) {
    try {
        var isValid = ssc.verifyObj(keys, null, msg)
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
