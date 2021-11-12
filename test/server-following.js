require('dotenv').config()
var test = require('tape')
var serverIsFollowing = require('../server-is-following')
var followMe = require('../follow-me')
var ssc = require('@nichoth/ssc')
var bcrypt = require('bcrypt')

var user = ssc.createKeys()

test('follow me', t => {
    createHash('aaa')
        .then(hash => {
            // (passwords, inputPwd, id)
            followMe([hash], 'aaa', user.id)
                .then(() => {
                    t.end()
                })
                .catch(err => {
                    t.fail(err.toString())
                    t.end()
                })
        })
})

test('isFollowing', t => {
    serverIsFollowing(user.id)
        .then(isFoll => {
            t.equal(isFoll, true, 'should return isFollowing = true')
            t.end()
        })
})

function createHash (pw) {
    return bcrypt.hash(pw, 10)
        .then(hash => {
            return hash
        })
}





// test('check that the server is not following someone', t => {
//     user = ssc.createKeys()

//     serverFollowing.get(user.id)
//         .then(res => {
//             console.log('res', res)
//             t.ok(res, 'got a response')
//             t.ok(res.ok, 'should return "ok"')
//             t.equal(res.status, 401, 'should have the error code 200')
//             res.json().then(json => {
//                 t.equal(json.isFollowing, false, 'should return false')
//             })
//             t.end()
//         })
//         .catch(err => {
//             t.error(err, 'should not have an error')
//             t.end()
//         })
// })

// test('check that the server is following someone', t => {
//     // need to create a user,
//     // have the server follow the user,
//     // then do the test



// })
