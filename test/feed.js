require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var feed = require('../feed')
var fs = require('fs')

var keys = ssc.createKeys()
var { get, postOneMsg } = feed

test('get a feed', function (t) {
    get(keys.id)
        .then(res => {
            t.ok(res, 'got a response')
            t.equal(res.length, 0, 'should be an empty array')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('post one message', function (t) {
    var msg = ssc.createMsg(keys, null, { type: 'test', text: 'woooo' })

    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    postOneMsg(keys, msg, file)
        .then(res => {
            // console.log('res', res)
            t.equal(res.value.sequence, 1, 'should be the first message')
            t.equal(res.value.content.text, 'woooo', 'should have the right' +
                'content')
            t.ok(res.mentionUrls, 'should have img url')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})
