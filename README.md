# SSC fauna

SSC db built with [fauna db](https://fauna.com/)


---------------------------------------------------

1. Make a DB in fauna and put the secret key in `.env`.

.env
```
FAUNADB_SERVER_SECRET="123"
```

## example

avatar

```js
var avatar = require('@nichoth/ssc-fauna/avatar')
var { get, post } = avatar

get('@123')
    .then(res => {
        console.log(res.data)
    })

// will write a document like
// {
//   "data": {
       // about -- your public ID
//     "about": "aqIoSDv8jzWYBVKLr7/rQu/uxIHe/b8b+PWJp+Wziuw=.ed25519",
       // avatar link is the hash of the file
//     "avatarLink": "E21vi/w190Gmg+cfO5WXh6r6iYTzQkWUL9ah6shs4kc="
//   }
// }
post({ public: '123' }, file)
    .then(res => {
        console.log('res', res)
    })
```

