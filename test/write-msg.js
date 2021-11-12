var test = require('tape')
var writeMsg = require('../write-msg')
var ssc = require('@nichoth/ssc')
let cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

test('write a message', t => {
    var keys = ssc.createKeys()
    var msg = ssc.createMsg(keys, null, {
        type: 'test',
        text: 'wooo',
        mentions: []
    })

    writeMsg(keys, msg, getUrls)
        .then(res => {
            t.equal(res.value.author, keys.id,
                'should return the message we just wrote')
            t.end()
        })

    function getUrls (mentions) {
        return mentions.map(m => cloudinary.url(m))
    }
})
