/* eslint-disable @typescript-eslint/no-namespace */
import express, { type Request, type Response } from "express";
import * as dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import mongoose from "mongoose";
import { IUser } from "./interfaces/IUser";
import bodyParser from "body-parser";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

dotenv.config();
const uri: string | undefined = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 3000;

if (uri == null) {
    console.error("Please specify the MongoDB connection string in .env");
    process.exit(1);
}

// Only allow requests from the frontend, remove localhost during production
const allowedOrigins = ["http://localhost:3000", "https://password-manager-6841-something-awesome.onrender.com"];
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run(): Promise<void> {
    try {
        await client.connect();
        await client.db().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
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
    app.use("/items", itemRoutes);

    app.get("/", (req: Request, res: Response) => {
        res.send("Hello from the backend!");
    });

    app.listen(port, () => {
        console.log(`Backend server is running at http://localhost:${port}`);
    });
});
