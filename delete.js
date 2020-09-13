import faunadb from 'faunadb';
const client = new faunadb.Client({
    secret: process.env.db_key
});
var q = faunadb.query

module.exports = async (req, res) => {
    const { key, auth } = req.query
    if (auth !== process.env.auth) return res.status(405).json("creator endpoint")
    if (!(key && auth)) return res.status(405).json("AUTH error")
    if (key == "create") res.json("create is a protected endpoint.")
    let msg
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
    console.log("deleting", check.data[0][1])
    msg = await client.query(
        q.Delete(check.data[0][1])
    )
res.json(msg);
}