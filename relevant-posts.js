var faunadb = require('faunadb')
var xtend = require('xtend')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})


// TODO -- get the foaf posts

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
            // here we have an array of people you're following
            // the follwed id is
            // [{ value: { content: { contact } }}]
            // need to get everyone they're following
            return client.query(
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
        })
        .then(res => res.data.map(d => d.data))
        .then(foafArr => {
            // get posts in here
            return client.query(
                // get the posts by the `contact`s in the previous results
                q.Map(
                    q.Paginate(
                        q.Union(
                            // include your own id
                            [q.Reverse(q.Match(q.Index('author'), id))].concat(
                                foafArr.map(post => {
                                    return q.Reverse(q.Match(q.Index('author'),
                                        post.value.content.contact))
                                })
                            )
                        )
                    ),
                    q.Lambda('post', q.Get(q.Var('post')))
                )
            )
                // concat the msgs from 1 hop out
                .then(res => foafArr.concat(res.data.map(d => {
                    return xtend(d.data, {
                        value: xtend(d.data.value, {
                            previous: d.data.value.previous || null
                        })
                    })
                })))
        })
}

function get (id) {
    // TODO -- should be done in a single query, not multiple

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
                            [q.Reverse(q.Match(q.Index('author'), id))].concat(
                                arr.map(post => {
                                    return q.Reverse(q.Match(q.Index('author'),
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

