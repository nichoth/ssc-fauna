var faunadb = require('faunadb')
// var ssc = require('@nichoth/ssc')
var xtend = require('xtend')
let cloudinary = require("cloudinary").v2;

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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



module.exports = {
    get
}
