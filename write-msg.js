require('dotenv').config()
var faunadb = require('faunadb')
var xtend = require('xtend')
var ssc = require('@nichoth/ssc')
// var createHash = require('./create-hash')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})


// we don't do validation here,
// should be done by the server
// (except we do check the merkle-quality of the messages)
// getUrls -- a fn that return a list of urls, given a list of mentions
module.exports = function write (keys, msg, getUrls) {
    var q = faunadb.query
    var client = new faunadb.Client({
        secret: (process.env.NODE_ENV === 'test' ?
            process.env.FAUNADB_SERVER_SECRET_TEST :
            process.env.FAUNADB_SERVER_SECRET)
    })

    // get an existing feed
    // to check if the merkle list matches up
    return client.query(
        q.Get(
            q.Reverse( q.Match(q.Index('post-by-author'), '@' + keys.public) )
        )
    )
        .then(res => {
            if (res.data.key !== msg.previous) {
                return Promise.reject(new Error('mismatch previous'))
            }

            // msg list is ok, write it to DB
            return writeMsg(msg)
                .then(res => {
                    var imgUrls = getUrls(msg.content.mentions || [])
                    // msg.mentions.map(m => {
                    //     return cloudinary.url(m, {
                            // width: 100,
                            // height: 150,
                            // crop: "fill"
                    //     })
                    // })

                    return xtend(res[0], {
                        mentionUrls: imgUrls
                    })
                })
        })
        .catch(err => {
            if (err.name === 'NotFound') {
                // write the msg b/c the feed is new
                return writeMsg(msg)
                    .then(res => {
                        var imgUrls = getUrls(msg.content.mentions || [])
                        // add the url for the photo
                        return xtend(res.data, {
                            mentionUrls: imgUrls
                        })
                    })
            }

            throw err
        })

}

function writeMsg (msg) {
    var msgHash = ssc.getId(msg)

    // TODO -- what's going on with the data attribute duplication?
    return client.query(
        q.Create(q.Collection('posts'), {
            value: msg,
            key: msgHash,
            data: { value: msg, key: msgHash }
        })
    )
}
