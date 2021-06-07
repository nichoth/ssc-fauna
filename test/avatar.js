require('dotenv').config()
var fs = require('fs')
var test = require('tape')
var avatar = require('../avatar')

// you can post any avatar for the time being,
// the server doesn't verify the msg
var keys = { public: '123' }

test('post an avatar', function (t) {
    // read binary data
    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    avatar.post(keys, file)
        .then(() => {
            t.pass('should create an avatar document')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('get an avatar', function (t) {
    t.plan(1)

    avatar.get('@' + keys.public)
        .then(res => {
            t.equal(res.data.about, '@123', 'should return the right' +
                ' public id in `get` request')
        })
        .catch(err => t.error(err))
})


