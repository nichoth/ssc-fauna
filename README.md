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


