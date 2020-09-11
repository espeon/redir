so, first you'll need a faunadb database. 

once you make an account, click "new database" and for the database name, fill in whatever.

then you'll need to make a collection. once in your db dashboard, click collections > new collection.

fill in the collection name (`urls`) and click save.

next, you'll have to make an index. same thing, in your db dashboard click indexes > new index.

call your index `urls_by_key` and under terms, enter `data.key` and under values enter `data.value` and `ref`.

next, go to the security tab and click new key. click save, then copy the key it gives you and save it somewhere important.


rename env.example to .env and fill in your `db_key` (created in the last step) and your `auth` key (whatever is fine).


now you can deploy!

install the vercel cli and do ```vc``` in whatever shell you use. 