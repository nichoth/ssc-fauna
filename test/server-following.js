require('dotenv').config()
var test = require('tape')
var serverFollowing = require('../server-following')
var ssc = require('@nichoth/ssc')

var user

test('todo', t => {
    console.log('todo')
    t.end()
})

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
