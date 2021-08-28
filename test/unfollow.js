require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var unfollow = require('../unfollow')
var profile = require('../profile')
var follow = require('../follow')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()
// var userThree = ssc.createKeys()

test('follow then unfollow someone', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: keys.id
    }

    // need to create a msg for post req
    msg = ssc.createMsg(keys, null, msgContent)

    // create a name for userTwo
    profile.post(userTwo.id, null, { name: 'fooo' })
        .then(() => {
            return followThem()
        })
        .catch(err => {
            t.fail('got an error')
            console.log('errrrrrr', err)
            t.end()
        })

    function followThem () {
        // this should return the profile document for the followed user
        return follow.post(keys, msg)
            .then((res) => {
                console.log('follow res', res)
                t.pass('should create a follow document')
                // the author is the person who wrote the message naming
                // themselves
                // TODO -- check that it returns the profile of followed
                //   person
                t.equal(res.value.name, 'fooo',
                    'should return the user profile of the person that ' +
                    'youre following')
                t.equal(res.about, userTwo.id,  
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
            type: 'follow',
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
