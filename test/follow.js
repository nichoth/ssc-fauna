require('dotenv').config()
var test = require('tape')
var fs = require('fs')
var follow = require('../follow')
var profile = require('../profile')
var avatar = require('../avatar')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()
var userThree = ssc.createKeys()

test('get the list of follows', function (t) {
    follow.get(keys.id)
        .then(res => {
            t.equal(Object.keys(res).length, 0, 'should return an empty list')
            t.end()
        })
        .catch(err => {
            console.log('boooooooooo1', err)
            t.error(err)
            t.end()
        })
})

var msg

test('follow a user', function (t) {
    // create a name for userTwo
    var profileMsg = ssc.createMsg(userTwo, null, {
        type: 'profile',
        about: userTwo.id,
        name: 'fooo'
    })

    profile.post(userTwo.id, null, profileMsg)
        .then((res) => {
            // console.log('profile res', res)
            return followThem()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
        })

    function followThem () {
        var msgContent = {
            type: 'follow',
            contact: userTwo.id,
            author: keys.id
        }

        // need to create a msg for post req
        msg = ssc.createMsg(keys, null, msgContent)

        // this should return the profile document for the followed user
        return follow.post(keys, msg)
            .then((res) => {
                // console.log('**ressss to follow.post**', res)
                t.pass('should create a follow document')
                // the author is the person who wrote the message naming
                // themselves
                // TODO -- check that it returns the profile of followed
                //   person
                t.equal(res.value.content.name, 'fooo',
                    'should return the user profile of the person that ' +
                    'youre following')
                t.equal(res.value.content.about, userTwo.id,  
                    'should have the right user ID')
                t.end()
            })
            .catch(err => {
                console.log('***** oh dear', err)
                t.error(err)
                t.end()
            })
    }
})

test('follow another user', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userThree.id,
        author: keys.id
    }

    var followMsg2 = ssc.createMsg(keys, msg, msgContent)

    profTwoMsg = ssc.createMsg(userThree, null, {
        type: 'profile',
        about: userThree.id,
        name: 'barrr'
    })

    profile.post(userThree.id, null, profTwoMsg)
        .then(() => {
            return _followThem()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
        })

    function _followThem () {
        return follow.post(keys, followMsg2)
            .then((res) => {
                t.pass('should create a follow document')
                t.equal(res.value.content.name, 'barrr', 'should return the profile')
                t.equal(res.value.author, userThree.id,
                    'should have the right user ID')
                t.end()
            })
            .catch(err => {
                console.log('***** err', err)
                t.error(err)
                t.end()
            })
    }
})

test('get the list of follows', function (t) {
    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })
    avatar.post(userTwo, file)
        .then(() => {
            follow.get(keys.id)
                .then(res => {
                    // should return a map of { userID => profile data }
                    // where `userID` is a person you are following

                    t.ok(res[userTwo.id].avatarUrl,
                        'should return a url for the avatar')

                    t.ok(res[userTwo.id], 'should return a map')
                    t.equal(res[userTwo.id].id, userTwo.id,
                        'should have user two in the follow data')
                    t.equal(res[userThree.id].id, userThree.id,
                        'should have user three in the follow data')

                    t.end()
                })
                .catch(err => {
                    console.log('boooooooooo2', err)
                    t.error(err)
                    t.end()
                })
        })
})
