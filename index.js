const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3al0nc5.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productsCollection = client.db('root').collection('products');
        const productDetailsCollection = client.db('root').collection('productDetails');
        const cartCollection = client.db('root').collection('cart');
        const brandsCollection = client.db('root').collection('brands');
        const productTypeCollection = client.db('root').collection('type');


        // product api's
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        app.get('/products/:brand', async (req, res) => {
            const brand_name = req.params.brand;
            const query = { brand_name };
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result[0]);
        });

        app.patch('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            // const options = {upsert: true};
            const product = req.body;
            const updateProduct = {
                $set: {
                    ...product
                }
            }
            const result = await productsCollection.updateOne(filter, updateProduct);
            res.send(result);
        });


        // product details api's
        app.post('/details/:id', async (req, res) => {
            const id = req.params.id;
            const details = req.body;
            const productDetails = { productId: id, ...details };
            const result = await productDetailsCollection.insertOne(productDetails);
            res.send(result);
        });

        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { productId: id };
            const cursor = productDetailsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result[0]?.details || []);
        })


        // cart api's
        app.put('/cart/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email };
            const options = { upsert: true };
            const cart = req.body;
            const updatedCart = {
                $set: {
                    email,
                    cart
                }
            }
            const result = await cartCollection.updateOne(filter, updatedCart, options);
            res.send(result);
        });

        app.get('/cart/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email };
            const cursor = cartCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result[0].cart);
        });

        // brands
        app.get('/brands', async (req, res) => {
            const cursor = brandsCollection.find();
            const result = await cursor.toArray();
            const types = result.map(brand => brand.brand);
            res.send(types);
        });

        // product type
        app.get('/types', async (req, res) => {
            const cursor = productTypeCollection.find();
            const result = await cursor.toArray();
            const types = result.map(type => type.type);
            res.send(types);
        });






        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send(`root Sever is online...`);
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});