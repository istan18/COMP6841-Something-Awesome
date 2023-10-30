import mongoose, { Schema } from "mongoose";

import type { Item, ItemsDocument } from "../interfaces/Item";

const ItemSchema = new Schema<Item>({
    name: { type: String, required: true },
    password: { type: String, required: true },
    imageDataURL: { type: String, default: null },
});

const ItemsSchema = new Schema<ItemsDocument>({
    uId: { type: String, required: true },
    items: { type: [ItemSchema], required: true },
});

const ItemsModel = mongoose.model<ItemsDocument>("Items", ItemsSchema);

export default ItemsModel;
