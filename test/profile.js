require('dotenv').config()
var profile = require('../profile')
var test = require('tape')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()

test('profile', t => {
    // need to create a user with the profile
    profile.get(keys.id)
        .then(res => {
            console.log('***got profile***', res)
        })
        t.end()
})

