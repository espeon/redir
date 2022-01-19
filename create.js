import faunadb from 'faunadb';
const client = new faunadb.Client({
    secret: process.env.db_key
});
var q = faunadb.query

module.exports = async (req, res) => {
    const { key, url, auth } = req.query
    console.log(req.query)
    if (auth !== process.env.auth) return res.status(405).json("creator endpoint") // we check if our **secret** (ooo) password is correct
    if (!(key && url && auth)) return res.status(405).json(genErr("KV Error", "One of the values required is missing.")) // if it is we check whether we have the other required things
    if (!validURL(url)) return res.status(405).json(genErr("Invalid URL", "The URL does not look like a valid URL."))
    if (key == "create") res.status(405).json(genErr("Protected Endpoint", "This endpoint is used for management, so it cannot be used for forwarding."))
    let msg // our eventual result
    // we check whether we already have a key in the database.
    let check = await client.query(
        // iterate each item in result
        q.Paginate(
            // make paginatable
            q.Match(
                // query index
                q.Index('urls_by_key'), key // specify source
            )
        )
    )
    console.log(check)
    if (check.data.length > 0) { // if we have a key already, we replace it (for now)
        console.log("replacing") // replacing, in this case, constitutes deleting the document and making a new document.
        console.log("deleting", check.data[0][1])
        msg = await client.query(
            q.Delete(check.data[0][1])
        )
        msg = await client.query(
            q.Create(q.Collection("urls"), { data: { key: key, value: url } })
        )
    }
    else { // if we don't have a key, we just make a new document.
        msg = await client.query(
            q.Create(q.Collection("urls"), { data: { key: key, value: url } })
        ).catch(async err => {
            console.log(err)
            res.status(405).json(genErr("Error", err))
        })
    }
    res.json(msg);
}

function validURL(str) {
    return str.includes("://") ? true : false;
}

function genErr(err, flavor) {
    let errMsg = {
        ts: 0,
        data: {
            key: err,
            value: flavor
        }
    }
    return errMsg;
}
