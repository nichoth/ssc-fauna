require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var feed = require('../feed')
var singlePost = require('../single-post')

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

var postKey 
test('get the feed again', function (t) {
    get(keys.id)
        .then(res => {
            postKey = res[0].key
            t.ok(res, 'got a response')
            t.equal(res.length, 1, 'should have 1 array item')
            t.equal(res[0].value.content.text, 'woooo', 'should have the ' +
                'right content')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('get a single post', function (t) {
    singlePost.get(postKey)
        .then(res => {
            // console.log('res', res)
            t.equal(res.value.content.text, 'woooo', 'should have the ' +
                'right content')
            t.end()
        }) 
        .catch(err => {
            t.error(err)
            t.end()
        })
})