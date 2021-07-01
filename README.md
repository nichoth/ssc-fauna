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

You can copy `.env.example` to `.env` and change the value of the secrets.

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
`follow / follows` -- who is the `author` following?


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
```

### follow a user

```js
require('dotenv').config()
var test = require('tape')
var follow = require('@nichoth/ssc-fauna/follow')
var ssc = require('@nichoth/ssc')
var keys = ssc.createKeys()
var userTwo = ssc.createKeys()

test('follow a user', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: keys.id
    }

    // need to create a msg for post req
    var msg = ssc.createMsg(keys, null, msgContent)

    follow.post(keys.id, keys, msg)
        .then((res) => {
            t.pass('should create a follow document')
            t.equal(res.value.author, keys.id,
                'should have the right user ID')
            t.equal(res.value.content.contact, userTwo.id,
                'should have the right contact in the message')
            t.end()
        })
        .catch(err => {
            console.log('***** err', err)
            t.error(err)
            t.end()
        })
})

test('get the list of who you are following', function (t) {
    follow.get(keys.id)
        .then(res => {
            // console.log('got res in test')
            // console.log(res)

            t.equal(Object.keys(res).length, 1,
                'should return an object with 1 thing')
            t.end()
        })
        .catch(err => {
            console.log('boooooooooo', err)
            t.error(err)
            t.end()
        })
})
```

### relevant posts
Get your own posts, and also posts of users you are following, and also foaf posts

#### relevantPosts.get

Get your posts and also posts by people you are following

```js
require('dotenv').config()
var createHash = require('crypto').createHash
var test = require('tape')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var relevantPosts = require('@nichoth/ssc-fauna/relevant-posts')
var follow = require('@nichoth/ssc-fauna/follow')
var { postOneMsg } = require('@nichoth/ssc-fauna/feed')

var userOne = ssc.createKeys()
var userTwo = ssc.createKeys()
var userThree = ssc.createKeys()

test('get relevant posts', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userTwo.id,
        author: userOne.id
    }

    // create a `follow` msg
    var msg = ssc.createMsg(userOne, null, msgContent)
    var followProm = follow.post(userOne.id, userOne, msg)

    // get the file
    var file = 'data:image/jpg;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    // get the file hash for the `mentions` array
    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')

    // create a `post` msg
    var msg2 = ssc.createMsg(userTwo, null, {
        type: 'test',
        text: 'woooo',
        mentions: [_hash]
    })

    // add some msgs so userTwo has a feed
    var feedProm = postOneMsg(userTwo, msg2, file)

    Promise.all([
        followProm,
        feedProm
    ])
        .then((res) => {
            // we are now following a feed with 1 post
            t.ok(res, 'got a response')

            // here we get relevant posts for userOne
            relevantPosts.get(userOne.id)
                .then(res => {
                    t.equal(res.length, 1, 'should return 1 thing')

                    t.equal(res[0].key, ssc.getId(res[0].value),
                        '`getId` returns the right key')

                    t.equal(res[0].key, ssc.getId(msg2),
                        'should have the same key from the message')

                    t.equal(res[0].value.author, userTwo.id,
                        'should be the right author id')

                    t.end()
                })
                .catch(err => {
                    t.error(err)
                    t.end()
                })
            })
        .catch(err => {
            console.log('errr oh no', err)
            t.error(err)
            t.end()
        })

})
```

#### relevantPosts.getWithFoafs 

Get posts of people you're following and also posts from your foafs

```js
test('foafs', function (t) {
    var msgContent = {
        type: 'follow',
        contact: userThree.id,
        author: userTwo.id
    }

    // create a `follow` msg -- userTwo follows userThree
    var followMsg = ssc.createMsg(userTwo, null, msgContent)
    var followProm = follow.post(userTwo.id, userTwo, followMsg)

    // make a post by userThree
    // get the file
    var file = 'data:image/jpg;base64,' +
        fs.readFileSync(__dirname + '/caracal.jpg', {
            encoding: 'base64'
        })

    // get the file hash for the `mentions` array
    var hash = createHash('sha256')
    hash.update(file)
    var _hash = hash.digest('base64')

    // create a `post` msg
    var msg = ssc.createMsg(userThree, null, {
        type: 'test',
        text: 'testing foafs',
        mentions: [_hash]
    })

    var postProm = postOneMsg(userThree, msg, file)

    Promise.all([
        followProm,
        postProm
    ])
        .then(() => {
            // in here, get relevants, b/c now userThree has a feed

            relevantPosts.getWithFoafs(userOne.id)
                .then(posts => {
                    // console.log('posts', JSON.stringify(posts, null, 2))

                    var post = posts.find(post => {
                        return post.value.author === userThree.id
                    })

                    t.ok(post, 'should have the post by userThree')

                    var userTwoPost = posts.find(post => {
                        return post.value.author === userTwo.id
                    })

                    t.ok(userTwoPost, 'should have a message by userTwo')
                    t.equal(userTwoPost.value.content.text, 'woooo',
                        'should have the post from userTwo')
                    t.end()
                })
                .catch(err => {
                    console.log('errrrr', err)
                    t.error(err)
                    t.end()
                })
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})
```

--------------------------------------------

[fauna social graph docs](https://docs.fauna.com/fauna/current/tutorials/social_graph?lang=javascript)



[example query](https://github.com/fauna-labs/fwitter/blob/main/src/fauna/queries/fweets.js#L364)