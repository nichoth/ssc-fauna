require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var unfollow = require('../unfollow')
var profile = require('../profile')
var follow = require('../follow')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()

test('follow then unfollow someone', function (t) {
    // create a name for userTwo
    profile.post(userTwo.id, null, ssc.createMsg(keys, null, {
        type: 'profile',
        about: userTwo.id,
        name: 'fooo'
    }))
        .then((res) => {
            return followThem()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
            t.end()
        })

    function followThem () {
        var msgContent = {
            type: 'follow',
            contact: userTwo.id,
            author: keys.id
        }

        // need to create a msg for post req
        msg = ssc.createMsg(keys, null, msgContent)

        // this should return the profile document for the followed user
        return follow.post(keys, msg)
            .then((res) => {
                t.pass('should create a follow document')
                t.equal(res.value.content.name, 'fooo',
                    'should return the user profile of the person that ' +
                    'youre following')
                t.equal(res.value.content.about, userTwo.id,  
                    'should have the right user ID')

                return _unfollow()
            })
            .catch(err => {
                console.log('***** ick', err)
                t.error(err)
                t.end()
            })
    }


    function _unfollow () {
        // need to create a msg for post req
        var unfollowMsg = ssc.createMsg(keys, null, {
            type: 'unfollow',
            contact: userTwo.id,
            author: keys.id
        })

        return unfollow.post(keys, unfollowMsg)
            .then(res => {
                console.log('**unfollow response**', res)
                t.pass('unfollowed')
                t.end()
            })
            .catch(err => {
                t.fail('got an error')
                console.log('errrrrr', err)
                t.end()
            })
    }
})
