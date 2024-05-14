const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const port = process.env.port || 9000

const app = express()

const corsOptions = {
    origin: [
      'http://localhost:5173',
    ],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  app.use(express.json())

  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lentaxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    const foodsCollection = client.db('flouricious').collection('foods')
    const purchaseCollection = client.db('flouricious').collection('purchase')

    // Fetching food
    app.get('/foods', async (req, res) => {
      const result = await foodsCollection.find().toArray()
      res.send(result)
    })

    // Fetching food by id
    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await foodsCollection.findOne(query)
      res.send(result)
    })


     // reading with email
    //  app.get("/foods/:email", async (req, res) => {
    //   const result = await foodsCollection
    //     .find({ email: req.params.email })
    //     .toArray();
    //   res.send(result);
    // });

    // save in db
    app.post('/foods', async (req, res) => {
      const foodData = req.body
      const result = await foodsCollection.insertOne(foodData)
      res.send(result)
    })

   // Fetching purchase
    app.get('/purchase', async (req, res) => {
      const result = await purchaseCollection.find().toArray()
      res.send(result)
    })
    
    // save in db
    app.post('/purchase', async (req, res) => {
      const purchaseData = req.body
      const result = await purchaseCollection.insertOne(purchaseData)
      res.send(result)
    })

   

    

    // Get all foods data from DB
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

  app.get('/', (req, res) =>{
    res.send('hello world')
  })
  
  app.listen(port, ()=>console.log(`server running on port ${port}`))