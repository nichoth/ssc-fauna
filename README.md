# SSC fauna

SSC database built with [fauna db](https://fauna.com/)

---------------------------------------------------

## env variables
1. Make a DB in fauna and put the secret key in `.env`.
The secret key determines which DB it will use

`.env` example:

```
FAUNADB_SERVER_SECRET="123"
CLOUDINARY_CLOUD_NAME="me"
CLOUDINARY_URL="cloudinary://719239934275155:example"
CLOUDINARY_API_SECRET="example-secret"
CLOUDINARY_API_KEY="123"
```

You can copy `.env.example` to `.env` and change the value of the secret.

--------------------------------------------

## prepare the DB
first create the necessary collections and indexes by
running `script/index.js`

```
$ node script
```


This will create several collections and indexes in the database --

`posts / author` -- get a feed by author id
`posts / key` -- get a specific post by its key
`avatar / avatar-by-id` -- get an avatar by user id
`abouts / about-by-author` -- get a username byt the user id


----------------------------------------

## test
```
$ npm test
```

---------------------------------------

## example

### avatar

```js
var avatar = require('@nichoth/ssc-fauna/avatar')
var { get, post } = avatar

get('@123')
    .then(res => {
        console.log(res.data)
    })

// `post` will write a document like
// {
//   "data": {
       // about -- your public ID
//     "about": "@123",
       // avatarLink is the hash of the file
//     "avatarLink": "E21vi/w190Gmg+cfO5WXh6r6iYTzQkWUL9ah6shs4kc="
//   }
// }
post({ public: '123' }, file)
    .then(res => {
        console.log('res', res)
    })
```

### feed

Post and get messages

```js
require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var feed = require('@nichoth/ssc-fauna/feed')
var singlePost = require('@nichoth/ssc-fauna/single-post')

var keys = ssc.createKeys()
var { get, postOneMsg } = feed

test('get a feed', function (t) {
    get(keys.id)
        .then(res => {
            t.ok(res, 'got a response')
            t.equal(res.length, 0, 'should be an empty array')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('post one message', function (t) {
    var msg = ssc.createMsg(keys, null, { type: 'test', text: 'woooo' })

    var file = 'data:image/png;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    postOneMsg(keys, msg, file)
        .then(res => {
            t.equal(res.value.sequence, 1, 'should be the first message')
            t.equal(res.value.content.text, 'woooo', 'should have the right' +
                'content')
            t.ok(res.mentionUrls, 'should have img url')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

var postKey 
test('get the feed again', function (t) {
    get(keys.id)
        .then(res => {
            postKey = res[0].key
            t.ok(res, 'got a response')
            t.equal(res.length, 1, 'should have 1 array item')
            t.equal(res[0].value.content.text, 'woooo', 'should have the ' +
                'right content')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('get a single post', function (t) {
    singlePost.get(postKey)
        .then(res => {
            t.equal(res.value.content.text, 'woooo', 'should have the ' +
                'right content in the response')
            t.end()
        }) 
        .catch(err => {
            t.error(err)
            t.end()
        })
})
```


### abouts
Set your username

```js
require('dotenv').config()
var test = require('tape')
var ssc = require('@nichoth/ssc')
var abouts = require('@nichoth/ssc-fauna/abouts')

var keys = ssc.createKeys()

test('create the user name', function (t) {
    var msgContent = {
        type: 'about',
        about: keys.id,
        name: 'fooo'
    }

    var msg = ssc.createMsg(keys, null, msgContent)

    abouts.post(keys, msg)
        .then((res) => {
            t.pass('should create an about document')
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
            t.end()
        })
        .catch(err => {
            console.log('***** err', err)
            t.error(err)
            t.end()
        })
})

test('get the user name', function (t) {
    abouts.get(keys.id)
        .then(res => {
            // console.log('got res in test', res)
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
            t.equal(res.value.content.name, 'fooo',
                'should have the right user name')
            t.end()
        })
        .catch(err => {
            console.log('boooooooooo', err)
            t.error(err)
            t.end()
        })
})

// TODO
// test for an invalid message
// the API function should return an error
```

