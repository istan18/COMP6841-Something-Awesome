import { Schema } from "mongoose";

import type { Item } from "../interfaces/Item";

const ItemSchema = new Schema<Item>({
    name: { type: String, required: true },
    password: { type: String, required: true },
    imageDataURL: { type: String, default: null },
});

export default ItemSchema;
