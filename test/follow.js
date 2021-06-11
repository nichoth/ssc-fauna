require('dotenv').config()
var test = require('tape')
var follow = require('../follow')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()

test('follow a user', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: keys.id
    }

    // need to create a msg for post req
    var msg = ssc.createMsg(keys, null, msgContent)

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

test('get the list of follows', function (t) {
    follow.get(keys.id)
        .then(res => {
            console.log('got res in test')
            console.log(res)
            console.log(res[0].value)

            t.equal(res.length, 1, 'should return an array')

            // could reduce the list server-side, do you would get
            // a map of id to profile
            // { '123': profile }

            // we should get back an array i think
            // then you want to reduce the array to a proper list

            t.end()
        })
        .catch(err => {
            console.log('boooooooooo', err)
            t.error(err)
            t.end()
        })
})

// TODO
// test for an invalid message. the API function should return an error
