require('dotenv').config()
var test = require('tape')
var fs = require('fs')
var follow = require('../follow')
var avatar = require('../avatar')
var abouts = require('../abouts')
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
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: keys.id
    }

    // need to create a msg for post req
    msg = ssc.createMsg(keys, null, msgContent)

    follow.post(keys.id, keys, msg)
        .then((res) => {
            t.pass('should create a follow document')
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
            t.equal(res.value.content.contact, userTwo.id,
                'should have the right contact in the message')
            t.end()
        })
        .catch(err => {
            console.log('***** err', err)
            t.error(err)
            t.end()
        })
})

test('follow another user', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userThree.id,
        author: keys.id
    }

    var msg2 = ssc.createMsg(keys, msg, msgContent)
    follow.post(keys.id, keys, msg2)
        .then((res) => {
            t.pass('should create a follow document')
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
            t.equal(res.value.content.contact, userThree.id,
                'should have the right contact in the message')
            t.end()
        })
        .catch(err => {
            console.log('***** err', err)
            t.error(err)
            t.end()
        })
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

test('set the user name', function (t) {
    var msg = ssc.createMsg(userTwo, null, {
        type: 'about',
        about: userTwo.id,
        name: 'fooo'
    })

    abouts.post(userTwo, msg)
        .then(() => {
            follow.get(keys.id)
                .then(res => {
                    // console.log('set name response', res)
                    // console.log('----------------------------------')
                    // console.log(res[userTwo.id].name.value)
                    // .data.value.content.name
                    t.equal(res[userTwo.id].name, 'fooo',
                        'should have the user name in the response')
                    t.end()
                })
        })
        .catch(err => {
            console.log('***** err', err)
            t.error(err)
            t.end()
        })
})

// TODO
// test for an invalid message. the API function should return an error

