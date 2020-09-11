import faunadb from 'faunadb';
const client = new faunadb.Client({
    secret: process.env.db_key
});
var q = faunadb.query

module.exports = async (req, res) => {
    const { key, url, auth } = req.query
    if (auth !== process.env.auth) return res.status(405).json("creator endpoint") // we check if our **secret** (ooo) password is correct
    if (!(key && url && auth)) return res.status(405).json("K/V Error") // if it is we check whether we have the other required things
    if(key == "create") res.status(405).json("create is a protected endpoint.")
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
        })
    }
    res.json(msg);
}