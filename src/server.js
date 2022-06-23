import bodyParser from "body-parser";
import {MongoClient} from "mongodb";
import  path from "path";
const express = require('express')
const app = express();
/*
const articlesInfo = {
        'learn-react' : {
            upvotes: 0,
            comments: [],
        },
        'learn-node' : {
            upvotes: 0,
            comments: []
        },
        'my-thoughts-on-resumes' : {
            upvotes: 0,
            comments: [
                {
                    firstname: '',
                    lastname : ''
                }
            ]
        }
    }


 */
    /*
      This module is called body-parser, and it allows our server to extract the JSON data  and it
     allows our server to extract the JSON data that we send along with our request. that we send along with our request.
     */
app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json())

/*
app.get('/hello',(req,res) => res.send('Hello'))
app.get('/hello/:name',(req,res) => res.send(`hello ${req.params.name}`))
app.post('/hello',(req,res) => res.send(`Hello ${req.body.name}`))




app.post('/api/articles/:name/upvote',(req,res) => {

    const article = req.params.name
    articlesInfo[article].upvotes += 1
    res.status(200).send(`${article} have a ${ articlesInfo[article].upvotes}  upvotes`)

})

app.post("/api/articles/:name/add-comment",(req,res) => {

    const {username, text} = req.body
    const article = req.params.name
    articlesInfo[article].comments.push({username, text})

    res.status(200).send(articlesInfo[article]);

})


 */



app.get('/api/articles/:name', async (req, res) => {
    try {
        const articleName = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('new-blog');

        const articleInfo =  await db.collection('articles').findOne({ name: articleName })
        res.status(200).json(articleInfo);

         await client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db', error });
    }

})



app.post('/api/articles/:name/upvote', async (req, res) => {
    try {
        const articleName = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('new-blog');

        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                upvotes: articleInfo.upvotes + 1,
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);

        await client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db', error });
    }
});

app.post("/api/articles/:name/add-comment",async (req, res) => {

    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    const db = client.db('new-blog');

    const {username, text} = req.body
    const article = req.params.name


    const articleInfo = await db.collection('articles').findOne({name: article});
    await db.collection('articles').updateOne({ name: article }, {
        '$set': {
            comments: articleInfo.comments.concat({username,text})
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: article });

    res.status(200).json(updatedArticleInfo);
    await client.close();



})

app.delete("/api/articles/:name",async (req, res) => {

    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    const db = client.db('new-blog');

    const article = req.params.name


    const articleInfo = await db.collection('articles').deleteOne({name: article});


    res.status(200).json(articleInfo);
    await client.close();



})

//  this line tells our app is that all of requests that aren't caught by any of our other API routes that aren't
//  caught by any of our other API routes should be passes on to our app. should be passes on to our app.
app.get('*',(req,res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, () => console.log('listing on port 8000'))