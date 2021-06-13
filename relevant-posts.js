var faunadb = require('faunadb')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

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
        .then(arr => {
            // console.log('aaarrrrr', arr)
            // console.log('aaarrrrr content', arr[0].value.content)
            return client.query(
                q.Map(
                    q.Paginate(
                        // TODO -- should pass an array to UNION
                        q.Union(
                            // include your own id
                            [q.Match(q.Index('author'), id)].concat(
                                arr.map(post => {
                                    return q.Match(q.Index('author'),
                                        post.value.content.contact)
                                })
                            )
                            // q.Match(q.Index('author'), arr[0].value.content.contact),
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
