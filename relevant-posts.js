var faunadb = require('faunadb')
var xtend = require('xtend')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

function get (id) {
    // TODO -- should be done in a single query, not multiple
    return client.query(

        // get everyone i'm following
        q.Map(
            q.Paginate(
                q.Reverse( q.Match(q.Index('following'), id) )
            ),
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
        )
    )
        .then(res => res.data.map(d => d.data))
        .then(arr => {
            // console.log('aaarrrrr', arr)
            // console.log('aaarrrrr content', arr[0].value.content)
            return client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            // include your own id
                            [q.Match(q.Index('author'), id)].concat(
                                arr.map(post => {
                                    return q.Match(q.Index('author'),
                                        post.value.content.contact)
                                })
                            )
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )
                .then(res => res.data.map(d => {
                    return xtend(d.data, {
                        value: xtend(d.data.value, {
                            previous: d.data.value.previous || null
                        })
                    })
                }))
        })
}

module.exports = { get }
