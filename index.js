const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1uor19o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const userCollection = client.db('tic-tac-toe').collection('user')
        const gamesCollection = client.db('tic-tac-toe').collection('games')
        const movesCollection = client.db('tic-tac-toe').collection('moves')
        app.get('/user', async (req, res) => {
            const query = {}
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/user', async (req, res) => {
            const userData = req.body
            const result = await userCollection.insertOne(userData)
            res.send(result)
        })
        app.post('/games', async (req, res) => {
            const game = req.body
            const result = await gamesCollection.insertOne(game)
            res.send(result)
        })
        app.get('/games', async (req, res) => {
            const email = req.query.email
            const query = { p1: email }
            const result = await gamesCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/games/board/:id', async (req, res) => {
            const id = req.params.id
            const game = { _id: ObjectId(id) }
            const result = await gamesCollection.findOne(game)
            res.send(result)
        })
    } finally { }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Tic tac toe server is running...')
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})