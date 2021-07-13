var faunadb = require('faunadb')
var xtend = require('xtend')
var ssc = require('@nichoth/ssc')
var createHash = require('crypto').createHash
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
                        var slugifiedHash = encodeURIComponent('' + mention)
                        var slugslug = encodeURIComponent(slugifiedHash)
                        return cloudinary.url(slugslug)      
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

    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')
    var slugifiedHash = encodeURIComponent('' + _hash)

    // console.log('????', msg.content.mentions[0] === _hash)

    // get an existing feed
    // to check if the merkle list matches up
    return client.query(
        q.Get(
            q.Reverse( q.Match(q.Index('author'), '@' + keys.public) )
        )
    )
        .then(res => {
            console.log('res', res)
            console.log('res.data.key', res.data.key)
            console.log('msg.previous', msg.previous)

            if (res.data.key !== msg.previous) {
                console.log('mismatch!!!!!', res.data.key, msg.previous)
                console.log('**prev key**', res.data.key)
                console.log('**msg.previous key**', msg.previous)

                return Promise.reject(new Error('mismatch previous'))
            }

            // msg list is ok, write it to DB
            return msgAndFile(msg, file, slugifiedHash, _hash)
                .then(res => {
                    // make the url here for the image
                    // var imgHash = res[0].value.content.mentions[0]
                    var slugslug = encodeURIComponent(slugifiedHash)
                    var imgUrl = cloudinary.url(slugslug, {
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
                return msgAndFile(msg, file, slugifiedHash, _hash)
                    .then(res => {  
                        var slugslug = encodeURIComponent(slugifiedHash)

                        // we slugify twice
                        var imgUrl = cloudinary.url(slugslug, {
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

    function msgAndFile (msg, file, slug, hash) {
        return Promise.all([
            writeMsg(msg, hash),
            upload(file, slug)
        ])
            .catch((err) => {
                console.log('errrrrr', err)
                revert(msg, file, slug)
            })
    }

    function writeMsg (_msg, hash) {
        // we are creating the msg and hash server side here
        // var msg = xtend(_msg, {
        //     content: xtend(_msg.content, {
        //         mentions: [hash]
        //     })
        // })





        // should just use the existing hash that was created client side
        var msg = _msg



        // console.log('msg in herererererere', msg)

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
    postOneMsg
}
