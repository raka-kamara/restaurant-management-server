const express = require('express')
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const port = process.env.port || 9000

const app = express()

const corsOptions = {
    origin: [
      'http://localhost:5173',
      "https://restaurant-management-4fdac.web.app",
      "https://restaurant-management-4fdac.firebaseapp.com",
      ],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(cookieParser())

  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lentaxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next) =>{
  console.log(req.method, req.url);
  next();
}

// const cookieOption = {
//   httpOnly: true,
//   secure: "production" ? true:false,
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
// }
async function run() {
  try {
    const foodsCollection = client.db('flouricious').collection('foods')
    const purchaseCollection = client.db('flouricious').collection('purchase')
    const feedbackCollection = client.db('flouricious').collection('feedback')

//  jwt api
// app.post('/jwt', async(req, res) =>{
//   const user = req.body;
//   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
//   res.cookie('token', token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: 'none'
//   })
//   // res.send({success: ture})
// })

app.post('/logout', async(req, res)=>{
  const user = req.body; 
  res.clearCookie('token', cookieOption,  {...cookieOption,maxAge: 0}).send({success: true})
})

// Services API
    // Fetching food
    app.get('/foods', logger, async (req, res) => {
      console.log('cock', req.cookies)
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
     app.get("/food/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await foodsCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // Delete
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });


    // save in db
    app.post('/foods', async (req, res) => {
      const foodData = req.body
      const result = await foodsCollection.insertOne(foodData)
      res.send(result)
    })


    // save in db
    app.post('/feedback', async (req, res) => {
      const feedbackData = req.body
      const result = await feedbackCollection.insertOne(feedbackData)
      res.send(result)
    })

   // Fetching feedback
    app.get('/feedback', async (req, res) => {
      const result = await feedbackCollection.find().toArray()
      res.send(result)
    })

    // Fetching feedback by id
    app.get('/feedback/:foodId', (req, res) => {
      const foodId = parseInt(req.params.foodId);
      const feedback = feedbackData.filter(item => item.foodId === foodId);
      res.json(feedback);
    });

    app.put("/food/:id", async (req, res) => {
     const id = req.params.id
     const foodData = req.body
     const query = {_id: new ObjectId(id)}
     const options = { upsert: true }
     const updateDoc = {
      $set: {
        ...foodData,
      },
    }
    const result = await foodsCollection.updateOne(query, updateDoc, options)
    res.send(result)
    });

    // app.put("/increasePurchase/:id", async(req, res) =>{
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)};
    //   const food = {
    //     $inc: {
    //       purchaseQuantity: 1
    //     }
    //   }
    //   const result = await foodsCollection.updateOne(query, food);
    //   res.send(result);
    // })

    // app.put("/decreaseQuantity/:id", async(req, res) =>{
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)};
    //   const food = {
    //     $inc: {
    //       quantity: -1
    //     }
    //   }
    //   const result = await foodsCollection.updateOne(query, food);
    //   res.send(result);
    // })
  
  app.get('/top-purchase', async (req, res) => {
      try {
        const result = await foodsCollection
          .find()
          .sort({ purchaseQuantity: -1 }) // Sort by totalPurchased in descending order
          .limit(6) // Limit the result to 6 items
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching purchases' });
      }
    });
    

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

     // reading with email
     app.get("/purchase/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await purchaseCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // Delete
    app.delete("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchaseCollection .deleteOne(query);
      res.send(result);
    });

   

    

    // Get all foods data from DB
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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