require('dotenv').config()
var profile = require('../profile')
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var createHash = require('crypto').createHash

var keys = ssc.createKeys()

test('non existant profile', t => {
    // need to create a user with the profile
    profile.get(keys.id)
        .then(res => {
            console.log('***got profile***', res)
            t.end()
        })
        .catch(err => {
            t.ok(err.toString().includes('instance not found'),
                'should return an error if a profile doesnt exist')
            t.end()
        })
})

test('set a new profile', t => {
    var msgContent = {
        type: 'profile',
        about: keys.id,
        name: 'fooo'
    }
    var msg = ssc.createMsg(keys, null, msgContent)

    profile.post(keys.id, null, msg)
        .then(res => {
            t.equal(res.value.content.name, 'fooo', 'should return the new profile')
            t.equal(res.value.content.about, keys.id, 'should return the right id')
            t.end()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
            t.end()
        })
})

test('get the profile we just made', t => {
    profile.get(keys.id)
        .then(res => {
            var content = res.value.content
            t.ok(res.key, 'has the msg key')
            t.equal(res.value.content.name, 'fooo',
                'should return the right profile name')
            t.equal(content.about, keys.id, 'should the the right user id')
            t.equal(content.type, 'profile', 'should have the right msg type')
            t.equal(content.avatar, null, 'should have the avatar as null')
            t.end()
        })
        .catch(err => {
            console.log('errrrrr', err)
            t.fail('error')
            t.end()
        })
})

test('set an avatar', t => {
    // read binary data
    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    var msgContent = {
        type: 'profile',
        about: keys.id,
        avatar: getHash(file)
    }

    var msg = ssc.createMsg(keys, null, msgContent)

    profile.post(keys.id, file, msg)
        .then(res => {
            // console.log('resssssss', res)
            t.equal(res.value.content.about, keys.id, 'should return the right id')
            t.equal(res.value.content.avatar, getHash(file),
                'should have the right image hash')
            t.end()
        })
        .catch(err => {
            console.log('cccccccc err', err)
            t.fail('errrrr')
            t.end()
        })
})

function getHash (file) {
    var hash = createHash('sha256')
    hash.update(file)
    return hash.digest('base64')
}
