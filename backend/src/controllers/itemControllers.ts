import UserModel from "../models/userModel";
import { type Request, type Response } from "express";
import CryptoJS from "crypto-js";
import { Item } from "../interfaces/Item";
import axios from "axios";

export const addItem = async (req: Request, res: Response): Promise<any> => {
    const { name, password, imageDataURL, key } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const itemExists = storedUser.items.find((item) => item.name === name);
    if (itemExists) {
        return res.status(409).json({ message: "Item already exists" });
    }

    const storedPassword = encryptPasswordWithKey(password, key);

    // If no image is provided, use a default image
    const defaultImg =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdkzG3UVRcUvXp7w2EXvsO7pxF8ekas7Ynxp2ri2HAVeonZunC6INi0-cUiKFfOUnqHxU&usqp=CAU";
    const imageUrlToDataUrl = async (imageUrl: string): Promise<string> => {
        try {
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

            const buffer = Buffer.from(response.data, "binary");
            const dataUrl = `data:${response.headers["content-type"]};base64,${buffer.toString("base64")}`;

            return dataUrl;
        } catch (error) {
            return "";
        }
    };

    const finalImageDataURL = imageDataURL ? imageDataURL : await imageUrlToDataUrl(defaultImg);

    const item: Item = {
        name,
        password: storedPassword,
        imageDataURL: finalImageDataURL,
    };

    storedUser.items.push(item);
    await storedUser.save();

    return res.status(201).json({ message: "Item created" });
};

export const getItems = async (req: Request, res: Response): Promise<any> => {
    const user = req.user;
    const { key } = req.body; // Usually would be a GET request, but to hide the key from the URL, use POST request
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const copyItems = storedUser.items.map((item) => {
        // Decrypts each password with the key provided
        const decryptedPassword = decryptPasswordWithKey(item.password, key);
        return { name: item.name, imageDataURL: item.imageDataURL, password: decryptedPassword };
    });

    return res.status(200).json({ items: copyItems });
};

export const deleteItem = async (req: Request, res: Response): Promise<any> => {
    const name = req.params.name;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = storedUser.items.findIndex((item) => item.name === name);
    if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found" });
    }

    storedUser.items.splice(itemIndex, 1);

    await storedUser.save();

    return res.status(200).json({ message: "Item deleted" });
};

export const editItem = async (req: Request, res: Response): Promise<any> => {
    const name = req.params.name;
    const { password, imageDataURL, key } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = storedUser.items.findIndex((item) => item.name === name);
    if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found" });
    }

    if (password) {
        // Re-encrypts the password with the new key
        const storedPassword = encryptPasswordWithKey(password, key);
        storedUser.items[itemIndex].password = storedPassword;
    }

    if (imageDataURL) {
        storedUser.items[itemIndex].imageDataURL = imageDataURL;
    }

    await storedUser.save();

    return res.status(200).json({ message: "Item edited" });
};

const encryptPasswordWithKey = (password: string, key: string): string => {
    return CryptoJS.AES.encrypt(password, key).toString();
};

const decryptPasswordWithKey = (encryptedPassword: string, key: string): string => {
    return CryptoJS.AES.decrypt(encryptedPassword, key).toString(CryptoJS.enc.Utf8);
};
