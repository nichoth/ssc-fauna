# SSC fauna

SSC db built with [fauna db](https://fauna.com/)


---------------------------------------------------

1. Make a DB in fauna and put the secret key in `.env`.

This secret key determines which DB the tests will use if you run them

.env
```
FAUNADB_SERVER_SECRET="123"
```

## example

### create indexes
first create the necessary indexes by running `script.js`
```
$ node script.js
```

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


