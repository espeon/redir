import faunadb from 'faunadb';
import del from "./delete.js"; //i think delete is a special variable?
import create from './create';

const client = new faunadb.Client({
  secret: process.env.db_key
});
var q = faunadb.query

module.exports = async (req, res) => {
  const { name = 'World', id } = req.query

  // set query headers so our cdn caches our stuff for a while
  res.setHeader('Cache-Control', 's-maxage=2628000');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');

  // if DELETE or POST is used we need these 
  if(req.method !== "GET")
  req.query.auth = req.headers.authorization.replace("Bearer ", "");
  req.query.url = req.headers.url? req.headers.url:req.query.url;
  req.query.key = req.query.key?req.query.key:id;
  try {
    switch (req.method) {
      case "POST":
        return create(req, res);
      case "DELETE":
        return del(req, res);
      case "OPTIONS": break;
      default:
        if(id === "create"){
          return create(req, res);
        }
        let msg = await client.query(
          q.Paginate(
            q.Match(
              q.Index('urls_by_key'), id
            )
          )
        );
        // if a key isn't found we just throw
        if (!msg.data[0]) throw "";

        return res.redirect(302, msg.data[0][0]);
        // redirects us where we want idfk
    }
  } catch (c) {
    // log and redirect to somewhere else
    console.log(c)
    return res.redirect("https://emma.iscute.dev")
  }
}