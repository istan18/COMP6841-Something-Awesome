/* eslint-disable @typescript-eslint/no-namespace */
import express, { type Request, type Response } from "express";
import * as dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import mongoose from "mongoose";
import User from "./interfaces/IUser";
import bodyParser from "body-parser";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

dotenv.config();
const uri: string | undefined = process.env.MONGODB_URI;
console.log(uri);

const app = express();
const port = 3001;

if (uri == null) {
    console.error("Please specify the MongoDB connection string in .env");
    process.exit(1);
}

const allowedOrigins = ["http://localhost:3000", "http://localhost:3002"];
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

app.use(cors(corsOptions));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run(): Promise<void> {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close whes you finish/error
        await client.close();
    }
}
run().catch(console.dir);
mongoose.connect(uri).then(() => {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.json());
    app.use("/users", userRoutes);

    app.get("/", (req: Request, res: Response) => {
        res.send("Hello from the backend!");
    });

    app.listen(port, () => {
        console.log(`Backend server is running at http://localhost:${port}`);
    });
});
