require('dotenv').config()
var faunadb = require('faunadb')
var xtend = require('xtend')
var ssc = require('@nichoth/ssc')
var createHash = require('./create-hash')
let cloudinary = require("cloudinary").v2;
var upload = require('./upload')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


function getByName (name) {
    return client.query(
        q.Map(
            q.Paginate( q.Reverse( q.Match(
                q.Index('author'),
                q.Select(
                    ['data', 'value', 'content', 'about'],
                    q.Get( q.Match(q.Index("about-by-name"), name) )
                )
            ) ) ),
        
            q.Lambda('postRef', q.Get(q.Var('postRef')))
        )
    )
        .then(res => {
            return res.data.map(d => d.data)
        })

}


function get (author) {
    return client.query(
        q.Map(
            q.Paginate(
                q.Reverse( q.Match(q.Index('author'), author) )
            ),
            q.Lambda( 'post', q.Get(q.Var('post')) )
        )
    )
        .then(function (res) {

            return res.data.map(post => {
                var mentionUrls = post.data.value.content
                    .mentions.map(mention => {

                        // slugify the hash twice
                        // don't know why we need to do it twice
                        // var slugifiedHash = encodeURIComponent('' + mention)
                        // var slugslug = encodeURIComponent(slugifiedHash)
                        return cloudinary.url(mention /*slugslug*/)
                    })

                var xtendedMsg = xtend(post.data, {
                    mentionUrls: mentionUrls
                })

                if (!xtendedMsg.value.previous) {
                    xtendedMsg.value.previous = null
                }

                return xtendedMsg
            })
        })
}


function postOneMsg (keys, msg, file) {
    var isValid
    try {
        isValid = ssc.verifyObj(keys, null, msg)
    } catch (err) {
        return Promise.reject(new Error('invalid message'))
    }

    if (!msg || !isValid) {
        return Promise.reject(new Error('invalid message'))
    }

    // need to check that the message has a mention for the given image

    // ------------------ start doing things ---------------------

    // see https://github.com/ssb-js/ssb-validate/blob/main/index.js#L149

    var hash = createHash(file)

    // get an existing feed
    // to check if the merkle list matches up
    return client.query(
        q.Get(
            q.Reverse( q.Match(q.Index('author'), '@' + keys.public) )
        )
    )
        .then(res => {
            if (res.data.key !== msg.previous) {
                console.log('mismatch!!!!!', res.data.key, msg.previous)
                console.log('**prev key**', res.data.key)
                console.log('**msg.previous key**', msg.previous)

                return Promise.reject(new Error('mismatch previous'))
            }

            // msg list is ok, write it to DB
            return msgAndFile(msg, file, hash)
                .then(res => {
                    var imgUrl = cloudinary.url(hash, {
                        // width: 100,
                        // height: 150,
                        // crop: "fill"
                    })

                    return xtend(res[0], {
                        mentionUrls: [imgUrl]
                    })
                })
        })
        .catch(err => {
            if (err.name === 'NotFound') {
                // write the msg b/c the feed is new
                return msgAndFile(msg, file, hash)
                    .then(res => {
                        // var slugslug = encodeURIComponent(slugifiedHash)

                        // we slugify twice
                        var imgUrl = cloudinary.url(hash, {
                            // width: 100,
                            // height: 150,
                            // crop: "fill"
                        })

                        // here, we add the url for the photo
                        var _response = xtend(res[0].data, {
                            mentionUrls: [imgUrl]
                        })

                        return _response
                    })
            }

            throw err
        })

    function msgAndFile (msg, file, hash) {
        return Promise.all([
            upload(file, hash),
            writeMsg(msg, hash)
        ])
            .catch((err) => {
                console.log('errrrrr', err)
                revert(msg, file, slug)
            })
    }

    function writeMsg (msg) {
        var msgHash = ssc.getId(msg)

        // we use the hash of the message *with* `mentions` array in it
        // thats what is written to the DB

        return client.query(
            q.Create(q.Collection('posts'), {
                key: msgHash,
                data: { value: msg, key: msgHash }
            })
        )
    }
}

module.exports = {
    get,
    getByName,
    postOneMsg
}
