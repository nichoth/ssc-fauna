require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var relevantPosts = require('../relevant-posts')
var follow = require('../follow')
var fs = require('fs')
var { postOneMsg } = require('../feed')

var keys = ssc.createKeys()
var userTwo = ssc.createKeys()

test('get relevant posts', function (t) {

    // ------------------ test follow content -------------
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: keys.id
    }

    // need to create a msg for post req
    var msg = ssc.createMsg(keys, null, msgContent)
    var followProm = follow.post(keys.id, keys, msg)

    var msg2 = ssc.createMsg(keys, null, { type: 'test', text: 'woooo' })

    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    // add some msgs so userTwo has a feed
    var feedProm = postOneMsg(keys, msg2, file)


    Promise.all([
        followProm,
        feedProm
    ])
        .then((res) => {
            // console.log('***res***', JSON.stringify(res, null, 2))
            // console.log('**content**', res[0].value.content)
            t.ok(res, 'got a response')
            doTheTest()
            // t.equal(res[1].length, 1, 'should have 1 message')
            // t.end()
        })
        .catch(err => {
            console.log('errr oh no', err)
            t.error(err)
            t.end()
        })

    // -------------------- /test follow content -------------



    function doTheTest () {
        relevantPosts.get(keys.id)
            .then(res => {
                // console.log('*****ressss****', JSON.stringify(res, null, 2))
                // console.log('*****0000****', JSON.stringify(res[0], null, 2))
                console.log('*****data****', JSON.stringify(res[0].data, null, 2))
            })
    }



})
