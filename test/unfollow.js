require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var unfollow = require('../unfollow')
var profile = require('../profile')
var follow = require('../follow')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()
var userThree = ssc.createKeys()

function createProfile (user) {
    return profile.post(user.id, null, ssc.createMsg(user, null, {
        type: 'profile',
        about: user.id,
        name: 'fooo'
    }))
}

function followThem (user, followed) {
    // need to create a msg for post req
    var msg = ssc.createMsg(user, null, {
        type: 'follow',
        contact: followed.id,
        author: user.id
    })

    // this should return the profile document for the followed user
    return follow.post(user, msg)
        .then((res) => {
            return res
        })
        .catch(err => {
            console.log('***** ick', err)
            t.error(err)
            t.end()
        })
}

function _unfollow (user, contact) {
    // need to create a msg for post req
    var unfollowMsg = ssc.createMsg(user, null, {
        type: 'unfollow',
        contact: contact.id,
        author: user.id
    })

    return unfollow.post(keys, unfollowMsg)
}

test('follow then unfollow someone', function (t) {
    // create a name for userTwo
    createProfile(userTwo)
        .then(() => followThem(keys, userTwo))
        .then((res) => {
            t.pass('should create a follow document')
            t.equal(res.value.content.name, 'fooo',
                'should return the user profile of the person that ' +
                'youre following')
            t.equal(res.value.content.about, userTwo.id,  
                'should have the right user ID')
            return res
        })
        .then(() => {
            return _unfollow(keys, userTwo)
        })
        .then(res => {
            t.pass('unfollowed')
            t.equal(res.value.content.contact, userTwo.id,
                'should send back the id of who you unfollowed')
            t.end()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
            t.end()
        })

})

test('another user follows, then you unfollow', t => {
    Promise.all([
        // first we re-follow them
        followThem(keys, userTwo),
        // now userThree is following userTwo
        followThem(userThree, userTwo)
    ])
        .then(() => {
            // now userOne needs to unfollow userTwo
            return _unfollow(keys, userTwo)
        })
        .then(res => {
            t.equal(res.value.content.contact, userTwo.id)
            t.end()
        })
        .catch(err => {
            t.fail(err, 'error')
            e.end()
        })
})
