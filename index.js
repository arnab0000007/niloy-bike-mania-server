const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mern-shop.yuqfv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('niloy-bike-mania');

    const usersCollection = database.collection('users');
    const productsCollection = database.collection('products');
    const orderCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');


    //------------------
    //--  users api   --
    //------------------
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })

  app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
  });

  app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });

  app.put('/users/admin', async (req, res) => {
      const email = req.body.email;
          const exsist = await usersCollection.findOne({ email: email });
          console.log(exsist);
          if (exsist) {
              const filter = { email: email };
              const updateDoc = { $set: { role: 'admin' } };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result);
          }else{
            res.json({"Message":"No Users Found With This Email"});
          }
    

  })


    //------------------
    //-- products api --
    //------------------

    //all products GET API
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      products = await cursor.toArray();
      res.send(products);
    });
    //single product GET API
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    })
    //add product POST API
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.json(result);
    });
    //product DELETE API 
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    })
    //------------------
    //--  orders api  --
    //------------------
    //all Orders GET API
    app.get('/orders', async (req, res) => {
      const cursor = orderCollection.find({});
      orders = await cursor.toArray();
      res.send(orders);
    });
    //user order get API
    app.get('/myOrders/:uid', async (req, res) => {
      const id = req.params.uid;
      const query = { userId: id.toString() }
      const orders = await orderCollection.find(query).toArray();
      res.json(orders);
    });
    // ORDER POST API
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    })
    //ORDER DELETE API 
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    })
    //UPDATE ORDER API
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          orderStatus: "Shipped"
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })

    
    //------------------
    //--  reviews api --
    //------------------

    //all reviews GET API
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      reviews = await cursor.toArray();
      res.send(reviews);
    });
    //add review POST API
    app.post('/reviews', async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.json(result);
    });

  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Niloy Bike Mania server is running');
});

app.listen(port, () => {
  console.log('Server running at port', port);
})