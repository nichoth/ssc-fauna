require('dotenv').config()
var createHash = require('crypto').createHash
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var relevantPosts = require('../relevant-posts')
var follow = require('../follow')
var { postOneMsg } = require('../feed')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()

test('get relevant posts', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: keys.id
    }

    // create a `follow` msg
    var msg = ssc.createMsg(keys, null, msgContent)
    var followProm = follow.post(keys.id, keys, msg)

    // get the hash of the file
    var file = 'data:image/jpg;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })


    // for the `mentions` array
    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')
    // var slugifiedHash = encodeURIComponent('' + _hash)




    // server-side, put the file-hash into the msg, then we get the key
    // for the msg


    // create a `post` msg
    var msg2 = ssc.createMsg(userTwo, null, {
        type: 'test',
        text: 'woooo',
        mentions: [_hash]
    })

    // add some msgs so userTwo has a feed
    var feedProm = postOneMsg(userTwo, msg2, file)

    Promise.all([
        followProm,
        feedProm
    ])
        .then((res) => {
            // we are now following a feed with 1 post
            t.ok(res, 'got a response')

            relevantPosts.get(keys.id)
                .then(res => {
                    console.log('resssss', JSON.stringify(res, null, 2))
                    console.log('------------------------')
                    console.log('msg', JSON.stringify(msg2, null, 2))

                    t.equal(res.length, 1, 'should return 1 thing')

                    t.equal(res[0].key, ssc.getId(res[0].value),
                        '`getId` returns the right key')

                    t.equal(res[0].key, ssc.getId(msg2),
                        'should have the same key from the message')

                    t.equal(res[0].value.author, userTwo.id,
                        'should be the right author id')

                    t.end()
                })
                .catch(err => {
                    t.error(err)
                    t.end()
                })
            })
        .catch(err => {
            console.log('errr oh no', err)
            t.error(err)
            t.end()
        })

})

test('relevant +1', function (t) {
    // TODO
    // post something to your own feed and verify that it's returned
    // in the result
    t.end()
})
