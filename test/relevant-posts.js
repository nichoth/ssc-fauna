require('dotenv').config()
var createHash = require('crypto').createHash
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var relevantPosts = require('../relevant-posts')
var follow = require('../follow')
var profile = require('../profile')
var { postOneMsg } = require('../feed')

var userOne = ssc.createKeys()
var userTwo = ssc.createKeys()
var userThree = ssc.createKeys()

test('get relevant posts when there are none', function (t) {
    relevantPosts.get(userOne.id)
        .then(res => {
            t.equal(res.length, 0, 'should return an empty array')
            t.end()
        })
        .catch(err => {
            console.log('errrrrrr', err)
            t.error(err)
            t.end()
        })
})

test('get relevant posts', function (t) {
    // must create a profile for the user before you follow them
    var profileMsg = ssc.createMsg(userTwo, null, {
        type: 'profile',
        about: userTwo.id,
        name: 'fooo'
    })

    // we create a profile and follow them here
    var profileProm = profile.post(userTwo.id, null, profileMsg)
        .then(res => {
            t.equal(res.value.content.name, 'fooo',
                'should return the new profile')
            t.equal(res.value.content.about, userTwo.id,
                'should return the right id')
            return createfollowProm()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
            t.end()
        })

    function createfollowProm () {
        // create a `follow` msg
        var msgContent = {
            type: 'follow',
            contact: userTwo.id,
            author: userOne.id
        }
        var msg = ssc.createMsg(userOne, null, msgContent)
        return follow.post(userOne, msg)
    }

        // get the file
        var file = 'data:image/jpg;base64,' +
            fs.readFileSync(__dirname + '/caracal.jpg', {
                encoding: 'base64'
            })

        // get the file hash for the `mentions` array
        var hash = createHash('sha256')
        hash.update(file)
        var _hash = hash.digest('base64')

    // create a `post` msg
    var msg2 = ssc.createMsg(userTwo, null, {
        type: 'test',
        text: 'woooo',
        mentions: [_hash]
    })

    // add some msgs so userTwo has a feed
    var feedProm = postOneMsg(userTwo, msg2, file)

    Promise.all([
        profileProm,
        feedProm
    ])
        .then((res) => {
            // we are now following a feed with 1 post
            t.ok(res, 'got a response')
            // console.log('**relevants res', JSON.stringify(res, null, 2))

            // here we get relevant posts
            relevantPosts.get(userOne.id)
                .then(res => {
                    // console.log('resssss', JSON.stringify(res, null, 2))
                    // console.log('------------------------')
                    // console.log('msg', JSON.stringify(msg2, null, 2))

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
    console.log('TODO')
    // post something to your own feed and verify that it's returned
    // in the result
    t.end()
})

test('call foafs when there are no foafs', function (t) {
    relevantPosts.getWithFoafs(userOne.id)
        .then(res => {
            t.equal(res.length, 1, 'should have just one result')
            t.end()
        })
        .catch(err => {
            console.log('errrrrrr', err)
            t.error(err)
            t.end()
        })
})

test('foafs', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userThree.id,
        author: userTwo.id
    }



    // create a profile for userThree



    // create a `follow` msg -- userTwo follows userThree
    var followMsg = ssc.createMsg(userTwo, null, msgContent)
    var followProm = follow.post(userTwo, followMsg)

    // make a post by userThree
    // get the file
    var file = 'data:image/jpg;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    // get the file hash for the `mentions` array
    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')

    // create a `post` msg
    var msg = ssc.createMsg(userThree, null, {
        type: 'test',
        text: 'testing foafs',
        mentions: [_hash]
    })

    var postProm = postOneMsg(userThree, msg, file)

    Promise.all([
        followProm,
        postProm
    ])
        .then(() => {
            // in here, get relevants, b/c now userThree has a feed

            relevantPosts.getWithFoafs(userOne.id)
                .then(posts => {
                    // console.log('posts', JSON.stringify(posts, null, 2))

                    var post = posts.find(post => {
                        return post.value.author === userThree.id
                    })
                    t.ok(post, 'should have the post by userThree')

                    var userTwoPost = posts.find(post => {
                        return post.value.author === userTwo.id
                    })

                    t.ok(userTwoPost, 'should have a message by userTwo')
                    t.equal(userTwoPost.value.content.text, 'woooo',
                        'should have the post from userTwo')
                    t.end()
                })
                .catch(err => {
                    console.log('errrrr', err)
                    t.error(err)
                    t.end()
                })
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})
