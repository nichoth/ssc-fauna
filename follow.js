var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

// see who you are following

// follow msgs are like
// {
// type: 'contact',
// author: my-id,
// contact: '@hxGxqPrplLjRG2vtjQL87abX4QKqeLgCwQpS730nNwE=.ed25519',
// following: true 
// }

function get (author) {
    return getFollowed(author)
        .then(followed => {
            // console.log('******ooooo here', followed.map(res => res.data))
            var _followed = followed.map(res => {
                return res.data.value.content.contact
            })
            return Promise.all([
                Promise.resolve(_followed),
                getAvatars(_followed),
                getNames(_followed)
            ])
        })
        .then(([followed, avas, names]) => {
            // console.log('****aaaaa fol, ava, names', followed, avas, names)
            var fols = followed.reduce((acc, doc, i) => {
                // console.log('**doc**', doc)
                acc[doc] = {
                    id: doc,
                    avatar: (avas && avas[i]) || null,
                    name: (names && names[i]) || null
                }
                return acc
            }, [])

            // console.log('**fols**', fols)
            // return [followed, avas, names]
            // var fold = followed.reduce((acc, fol) => {
            //     return acc
            // }, {})
            return fols
        })
}

function getFollowed (author) {
    return client.query(
        q.Map(
            q.Paginate(
                q.Match(q.Index('following'), author)
            ),
            q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
        )
    )
        .then(res => res.data)
}

function getAvatars (followed) {
    // console.log('in get avas', followed)

    return client.query(
        q.Map(
            // followed,
            followed,
            q.Lambda(
                'id',
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('avatar-by-id'), q.Var('id')),
                    ),
                    q.Lambda('msg', q.Get(q.Var('msg')))
                )
            )
        )
    )
        .then(res => {
            var _res = res.map(doc => doc.data)
            // console.log('ava res', _res)
            return _res
        })
        .catch(err => {
            console.log('***ava errrrrrr', err)
        })
}

function getNames (followed) {
    // console.log('in get names', followed)

    return client.query(
        q.Map(
            followed,
            q.Lambda(
                'id',
                // q.Match(q.Index('about-by-author'), q.Var('id'))
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('about-by-author'), q.Var('id')),
                    ),
                    q.Lambda('msg', q.Get(q.Var('msg')))
                )
            )
        )
    )
        .then(res => {
            var _res = res.map(doc => doc.data)
            // console.log('**name res', _res)
            return _res
        })
        .catch(err => {
            console.log('***name errrrrrr', err)
        })
}


// function get (author) {
//     return client.query(
//         q.Map(
//             q.Paginate(
//                 q.Reverse( q.Match(q.Index('following'), author) )
//             ),
//             q.Lambda( 'followMsg', q.Get(q.Var('followMsg')) )
//         )
//     )
//         .then(res => {
//             // TODO
//             // should get the avatar & profile info for each item in the array

//             // return res.data.map(doc => doc.data)
//             // TODO -- need to check the msg value for `following: false`
//             var map = res.data.reduce((acc, doc) => {
//                 // TODO -- should be the person's profile data
//                 // need to do another query to get the profile data
//                 acc[doc.data.value.content.contact] = doc.data
//                 return acc
//             }, {})

//             return map
//         })
// }

async function post (author, keys, msg) {
    // try {
    //     var lastFollowMsg = await client.query(
    //         q.Get(
    //             q.Match(q.Index('following'), author)
    //         )
    //     );
    // } catch (err) {
    //     if (err.message === 'instance not found') {
    //         // this means it's a new string of 'follow' msgs
    //         // and there is no ancestor
    //         // console.log('~~~~~ not found ~~~~~')
    //         var lastFollowMsg = null
    //     } else {
    //         throw err
    //     }
    // }

    // var lastMsg = lastFollowMsg ? lastFollowMsg.data.value : null

    // console.log('last follow*****', lastMsg)

    try {
        var isValid = ssc.verifyObj(keys, null, msg)
    } catch (err) {
        console.log('not isvalid', isValid, err)
        throw err
    }

    if (!isValid) {
        throw new Error('invalid message')
    }

    // write a new 'follow' msg
    var msgHash = ssc.getId(msg)
    return client.query(
        q.Create(q.Collection('follow'), {
            data: { value: msg, key: msgHash }
        })
    )
        .then(res => res.data)

}

module.exports = { post, get }
