import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
dotenv.config();
const uri: string | undefined = process.env.MONGODB_URI;

const app = express();
const port = 3001;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri!, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
