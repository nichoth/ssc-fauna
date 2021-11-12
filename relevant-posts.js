var faunadb = require('faunadb')
var xtend = require('xtend')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

function getFollowing (id) {
    return client.query(
        // get everyone `id` is following
        q.Map(
            q.Paginate(
                q.Reverse( q.Match(q.Index('following'), id) )
            ),
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
        )
    )
}

function getWithFoafs (id) {
    // return getFriendsAndFoafs(id)
    return getFollowing(id)
        // first we get everyone that `id` is following
        .then(res => res.data.map(d => d.data))
        .then(arr => {
            if (!arr.length) return Promise.resolve([ [], [] ])

            var postProm = client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            // get the posts for the foaf array
                            // include your own id
                            [q.Reverse(q.Match(q.Index('post-by-author'), id))].concat(
                                arr.map(post => {
                                    return q.Reverse(q.Match(q.Index('post-by-author'),
                                        post.value.content.contact))
                                })
                            )
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )

            // here we have an array of people you're following
            // the follwed id is
            // [{ value: { content: { contact } }}]
            // need to get everyone they're following
            var foafProm = client.query(
                q.Map(
                    q.Paginate(
                        q.Union(
                            arr.map(folMsg => {
                                return q.Reverse( q.Match(q.Index('following'),
                                    folMsg.value.content.contact) )
                            })
                        )
                    ),
                    q.Lambda('followMsg', q.Get(q.Var('followMsg')))
                )
            )

            return Promise.all([postProm, foafProm])
        })
        .then(([postRes, foafRes]) => [
            (postRes.data || []).map(d => d.data),
            (foafRes.data || []).map(d => d.data)
        ])
        .then(([postArr, foafArr]) => {
            // get posts in here
            return client.query(
                // get the posts by the `contact`s in the previous results
                q.Map(
                    q.Paginate(
                        q.Union(
                            // get the posts for the foaf array
                            // include your own id
                            [q.Reverse(q.Match(q.Index('post-by-author'), id))].concat(
                                foafArr.map(followMsg => {
                                    return q.Reverse(q.Match(q.Index('post-by-author'),
                                        followMsg.value.content.contact))
                                })
                            )
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )
                // concat the posts from 1 hop out with the foaf posts
                .then(res => postArr.concat(res.data.map(d => {
                    return xtend(d.data, {
                        value: xtend(d.data.value, {
                            previous: d.data.value.previous || null
                        })
                    })
                })))
        })
}

function get (id) {
    return getFollowing(id)
        .then(res => res.data.map(d => d.data))
        .then(arr => {
            // console.log('aaarrrrr', arr)
            return client.query(
                // get the posts by the `contact`s in the previous results
                q.Map(
                    q.Paginate(
                        q.Union(
                            // include your own id
                            [q.Reverse(q.Match(q.Index('post-by-author'), id))].concat(
                                arr.map(post => {
                                    return q.Reverse(q.Match(q.Index('post-by-author'),
                                        post.value.content.contact))
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

module.exports = {
    get,
    getWithFoafs
}
