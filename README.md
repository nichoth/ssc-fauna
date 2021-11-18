# SSC fauna

SSC database built with [fauna db](https://fauna.com/)

The official protocol, for now, is to do validation in the server code, in here
we just write what we're given to the DB.

---------------------------------------------------

## install
```
$ npm i @nichoth/ssc-fauna
```

-------------------------------------------------

## env variables
1. Make a DB in fauna and put the secret key in `.env`.
The secret key determines which DB it will use

`.env` example:

```
FAUNADB_SERVER_SECRET="123"
FAUNADB_SERVER_SECRET_TEST="123"
NODE_ENV=test
```

You can copy `.env.example` to `.env` and change the value of the secrets.

--------------------------------------------

## prepare the DB
Create the necessary collections and indexes by running `script/index.js`

```
$ NODE_ENV=test node script
```

This will create several collections and indexes in the database --

`posts / author` -- get a feed by author id
`posts / key` -- get a specific post by its key
`avatar / avatar-by-id` -- get an avatar by user id
`abouts / about-by-author` -- get a username by the user id
`follow / follows` -- who is the `author` following?


----------------------------------------

## test
```
$ npm test
```

---------------------------------------

## example

### write message

```js
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
```
