require('dotenv').config()
var bcrypt = require('bcrypt')
var faunadb = require('faunadb')
var q = faunadb.query

module.exports = async function (pwds, password, id) {
    var ok = (password && await pwds.reduce(async (acc, pwdHash) => {
        // return true if any of them match
        return (acc || await bcrypt.compare(password, pwdHash))
    }, false))

    if (!ok) {
        return Promise.reject('invalid password')
    }

    var client = new faunadb.Client({
        secret: (process.env.NODE_ENV === 'test' ?
            process.env.FAUNADB_SERVER_SECRET_TEST :
            process.env.FAUNADB_SERVER_SECRET)
    })

    // write the the DB that we are following the user
    return client.query(
        q.Create(q.Collection('server-following'), {
            data: { type: 'follow', contact: id }
        })
    )
        .then(res => {
            return res.data
        })
        .catch(err => {
            throw new Error(err)
            // TODO
            // in here, handle the case where it is an existing user
            // (we are already following them)
            // should return a success in that case
        })

}
