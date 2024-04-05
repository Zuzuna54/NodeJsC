// Posts service app and router 
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};


app.get('/posts', (req, res) => {
    console.log("Posts service get posts");
    res.send(posts);

});

app.post('/posts', (req, res) => {
    console.log("Posts service post posts");
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;
    posts[id] = {
        id, title
    };
    res.status(201).send(posts[id]);
});

app.listen(4000, () => {
    console.log('Posts service listening on port 4000');
});