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

// q.Get( q.Match(q.Index('profile-by-id'), msg.content.contact) ),

function get (author) {

    // client.query(
    //     q.Get(q.Match(q.Index('profile-by-id'), author))
    // )
    //     .then(res => console.log('***aaaa***', res.data))
    //     .catch(err => console.log('****aaarrrrr***', err))

    return client.query(
        q.Map(
            q.Paginate( q.Match(q.Index('following'), author) ),
            q.Lambda('msg', q.Get(
                q.Match(
                    q.Index('profile-by-id'),
                    q.Select(
                        ['data', 'value', 'content', 'contact'],
                        q.Get(q.Var('msg'))
                    )
                )
            ))
        )
    )
        .then(res => {
            return res.data
                .map(d => d.data)
                // convert to a map of userID => profile
                .reduce((acc, msg) => {
                    acc[msg.value.content.about] = msg.value.content
                    return acc
                }, {})
        })
        .catch(err => {
            console.log('errrrr', err)
        })
}


// keys needs to have { id, public }
async function post (keys, msg) {
    try {
        // console.log('bbbbbbb', keys)
        // console.log('cccccc', msg)
        var isValid = ssc.verifyObj(keys, null, msg)
        keys = keys.public ? keys : { public: keys }
    } catch (err) {
        console.log('not isvalid aaaaa', isValid, err)
        throw err
    }

    if (!isValid) {
        throw new Error('invalid message')
    }

    // console.log('****msg****', msg)

    // write a new 'follow' msg
    var msgHash = ssc.getId(msg)

    // follow them,
    // then get the profile for them
    return client.query(
        q.Do(
            q.Create(q.Collection('follow'), {
                data: { value: msg, key: msgHash }
            }),
            q.Get( q.Match(q.Index('profile-by-id'), msg.content.contact) ),
        )
    )
        .then(res => res.data)
        .catch(err => {
            console.log('arg', err)
            throw err
        })

}

module.exports = { post, get }
