var faunadb = require('faunadb')
// var xtend = require('xtend')
// var ssc = require('@nichoth/ssc')
// let cloudinary = require("cloudinary").v2;

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// we need to get...
// need to get each of the followed ids
// up to a certain total # of posts... 50? sorted by time

// an index
// source collection -- `posts`
// terms -- values from the documents -- here it is data.value.author i think

function get (id) {
    return client.query(

        // get everyone i'm following
        q.Map(
            q.Paginate(
                q.Reverse( q.Match(q.Index('following'), id) )
            ),

            // in this lambda, we have the follow msgs
            // need to get the 'value.content.contact'
            // and use that in a query to get the feed of the contact
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
            // q.Paginate(
            //     q.Reverse( q.Match(q.Index('author'), id) )
            // ),
            // q.Lambda('post', q.Get(q.Var('post')))
        )
    )
        .then(res => res.data.map(d => d.data))
        // data is an array
        // .then(data => {
        //     console.log('aaaaaa data', data)
        //     return data
        // })
        // data is now an array of the msg objects
        .then(arr => {
            // console.log('aaarrrrr', arr)
            // console.log('aaarrrrr content', arr[0].value.content)
            return client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            // include your own id
                            q.Match(q.Index('author'), id),
                            // TODO -- get everyone's feed in the response
                            // above (the `arr` variable)
                            q.Match(q.Index('author'), arr[0].value.content.contact)
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )
                .then(res => res.data.map(d => d.data))
                // .then(ds => ds.map(d => d.data))
        })

        // .then(res => {
        //     return res.data.map(doc => {
        //         var docs = doc.data
        //         // just doing it in here as a placeholder

        //         return client.query(
        //             q.Paginate(
        //                 q.Union(
        //                     q.Match(q.Index('author'), id),
        //                     q.Match(q.Index('author'), docs[0].value.content.contact)
        //                 )
        //             )
        //         )
        //     })
        // })
}




// function get (id) {
//     return client.query(
//         q.Map(
//             q.Paginate(
//                 // need to get the list of who you're following
//                 // then use that list to ge the user id's used in this query
//                 // q.Union(
//                     // everyone i am following
//                 q.Map(
//                     // q.Paginate(
//                         q.Reverse( q.Match(q.Index('following'), id) ),
//                     // ),
//                     q.Lambda('followed', q.Match(
//                         q.Index( 'author', q.Var('followed') )
//                     ))
//                 )
//                 // ),
//                 // in here, need to get results from several authors
//                 // q.Reverse( q.Match(q.Index('author'), id) )
//             ),
//             q.Lambda( 'post', q.Get(q.Var('post')) )
//         )
//     )
//         .then(function (res) {
//             console.log('ressssssssss', res)
//         })
// }

module.exports = { get }
