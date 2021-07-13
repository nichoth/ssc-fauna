require('dotenv').config()
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
            t.pass('should create an about document')
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
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
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
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

test('get the user ID from the name', function (t) {
    abouts.getByName('fooo')
        .then(res => {
            t.ok(res.length > 1, 'should return all matches for the name')
            t.ok(res[0].value.content.about, 'should have the ID of the' +
                ' named person')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

// TODO
// test for an invalid message
// the API function should return an error
