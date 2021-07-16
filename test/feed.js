require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var feed = require('../feed')
var singlePost = require('../single-post')
var createHash = require('crypto').createHash
var crypto = require("crypto");

var abouts = require('../abouts')

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

var msg
var file

test('post one message', function (t) {
    file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')

    msg = ssc.createMsg(keys, null, {
        type: 'post',
        text: 'woooo',
        mentions: [_hash]
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

test('post another msg', function (t) {
    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')

    var msg2 = ssc.createMsg(keys, msg, {
        type: 'post',
        text: 'woooo2',
        mentions: [_hash]
    })

    postOneMsg(keys, msg2, file)
        .then(res => {
            t.equal(res.data.value.sequence, 2, 'should be the second message')
            t.equal(res.data.value.content.text, 'woooo2', 'should have the right' +
                'content')
            t.ok(res.mentionUrls, 'should have img url')
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
            t.equal(res.value.content.text, 'woooo', 'should have the ' +
                'right content in the response')
            t.end()
        }) 
        .catch(err => {
            t.error(err)
            t.end()
        })
})

var name = crypto.randomBytes(8).toString('hex');

test('name the feed', function (t) {
    var msgContent = {
        type: 'about',
        about: keys.id,
        name: name
    }
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

test('get a feed by name', function (t) {
    // console.log('name', name)
    feed.getByName(name)
        .then(res => {
            // console.log('**res**', res)
            // console.log('my keys', keys)
            t.ok(Array.isArray(res), 'should return an array')
            var myPosts = res.filter(post => {
                return post.value.author === keys.id
            })
            t.equal(myPosts.length, 2, 'should return the right number msgs')
            t.equal(res[0].value.content.type, 'post', 'should return posts')
            t.end()
        })
        .catch(err => {
            console.log('errrrr', err)
            t.error(err)
            t.end()
        })
})
