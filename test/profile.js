require('dotenv').config()
var profile = require('../profile')
var test = require('tape')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()

test('non existant profile', t => {
    // need to create a user with the profile
    profile.get(keys.id)
        .then(res => {
            console.log('***got profile***', res)
        })
        .catch(err => {
            t.ok(err.toString().includes('instance not found'),
                'should return an error if a profile doesnt exist')
            t.end()
        })
})

test('set a new profile', t => {
    profile.post(keys.id, { name: 'fooo' })
        .then(res => {
            t.equal(res.data.name, 'fooo', 'should return the new profile')
            t.equal(res.data.about, keys.id, 'should return the right id')
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
            t.equal(res.name, 'fooo', 'should return the right profile')
            t.equal(res.author, keys.id, 'should return the right id')
            t.end()
        })
        .catch(err => {
            console.log('errrrrr', err)
            t.fail('error')
            t.end()
        })
})

// test('get a profile', t => {

// })