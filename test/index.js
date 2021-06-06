var fs = require('fs')
var test = require('tape')
var avatar = require('../avatar')

test('post an avatar', function (t) {
    // read binary data
    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    avatar.post({ kys: { public: '123' } }, file)
})

