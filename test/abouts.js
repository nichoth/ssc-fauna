require('dotenv').config()
// var fs = require('fs')
var test = require('tape')
var abouts = require('../abouts')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()

test('create the user name', function (t) {

    var msgContent = {
        type: 'about',
        about: keys.id,
        name: 'fooo'
    }

    // need to create a msg for post req
    var msg = ssc.createMsg(keys, null, msgContent)

    abouts.post(keys, msg)
        .then((res) => {
            // console.log('in here res', res)
            t.pass('should create an about document')
            t.equal(res.value.author, keys.id, 'should have the right user ID')
            t.end()
        })
        .catch(err => {
            console.log('***** err', err)
            t.error(err)
            t.end()
        })
})

test('get the user name', function (t) {
    abouts.get(keys.id)
        .then(res => {
            // console.log('got res in test', res)
            t.equal(res.value.author, keys.id, 'should have the right user ID')
            t.equal(res.value.content.name, 'fooo',
                'should have the right user name')
            t.end()
        })
        .catch(err => {
            console.log('boooooooooo', err)
            t.error(err)
            t.end()
        })
})
