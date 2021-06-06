require('dotenv').config()
var fs = require('fs')
var test = require('tape')
var avatar = require('../avatar')

test('post an avatar', function (t) {
    // read binary data
    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    avatar.post({ public: '123' }, file)
        .then(() => t.end())
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('get an avatar', function (t) {
    t.plan(1)

    avatar.get('@123')
        .then(res => {
            t.equal(res.data.about, '@123')
        })
        .catch(err => t.error(err))
})


