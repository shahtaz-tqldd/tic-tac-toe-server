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
            const p2Query = await userCollection.findOne({ email: game.p2 })
            if (p2Query) {
                const p2Name = p2Query.displayName
                const insertGame = { ...game, p2Name }
                console.log(insertGame)
                const result = await gamesCollection.insertOne(insertGame)
                res.status(200).send(result)
            }
            res.status(403).send({ message: 'Forbidden' })
        })
        app.get('/games', async (req, res) => {
            const email = req.query.email
            if (email) {
                const query1 = { p1: email }
                const query2 = { p2: email }
                const result1 = await gamesCollection.find(query1).toArray();
                const result2 = await gamesCollection.find(query2).toArray();
                const result = [...result1, ...result2]
                console.log(result)
                
                res.send(result)
            } else {
                const result = await gamesCollection.find({}).toArray()
                res.send(result)
            }
        })
        app.put('/games', async (req, res) => {
            const moved = req.body
            const {player, board, lastMove} = moved
            const filter = { _id: ObjectId(moved._id)}
            const options = { upsert: true }
            const updatedDoc = {
                $set: { [board] : player, lastMove }
            }
            const result = await gamesCollection.updateOne(filter, updatedDoc, options)
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