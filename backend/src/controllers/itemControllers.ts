import UserModel from "../models/userModel";
import { type Request, type Response } from "express";
import ItemsModel from "../models/itemsModel";
import CryptoJS from "crypto-js";

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

    const usersItems = await ItemsModel.findOne({ uId: storedUser._id });
    if (!usersItems) {
        return res.status(404).json({ message: "User items not found" });
    }

    const itemExists = usersItems.items.find((item) => item.name === name);
    if (itemExists) {
        return res.status(409).json({ message: "Item already exists" });
    }

    const storedPassword = encryptPasswordWithKey(password, key);

    usersItems.items.push({ name, password: storedPassword, imageDataURL });
    await usersItems.save();

    return res.status(201).json({ message: "Item created" });
};

export const getItems = async (req: Request, res: Response): Promise<any> => {
    const user = req.user;
    const { key } = req.body;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const usersItems = await ItemsModel.findOne({ uId: storedUser._id });
    if (!usersItems) {
        return res.status(404).json({ message: "User items not found" });
    }

    const copyItems = usersItems.items.map((item) => {
        const decryptedPassword = decryptPasswordWithKey(item.password, key);
        return { ...item, password: decryptedPassword };
    });

    return res.status(200).json({ items: copyItems });
};

export const deleteItem = async (req: Request, res: Response): Promise<any> => {
    const { name } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const usersItems = await ItemsModel.findOne({ uId: storedUser._id });
    if (!usersItems) {
        return res.status(404).json({ message: "User items not found" });
    }

    const itemIndex = usersItems.items.findIndex((item) => item.name === name);
    if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found" });
    }

    usersItems.items.splice(itemIndex, 1);

    await usersItems.save();

    return res.status(200).json({ message: "Item deleted" });
};

export const editItem = async (req: Request, res: Response): Promise<any> => {
    const { name, password, imageDataURL, key } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const usersItems = await ItemsModel.findOne({ uId: storedUser._id });
    if (!usersItems) {
        return res.status(404).json({ message: "User items not found" });
    }

    const itemIndex = usersItems.items.findIndex((item) => item.name === name);
    if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found" });
    }

    if (password) {
        const storedPassword = encryptPasswordWithKey(password, key);
        usersItems.items[itemIndex].password = storedPassword;
    }

    if (imageDataURL) {
        usersItems.items[itemIndex].imageDataURL = imageDataURL;
    }

    if (name) {
        usersItems.items[itemIndex].name = name;
    }

    await usersItems.save();

    return res.status(200).json({ message: "Item edited" });
};

const encryptPasswordWithKey = (password: string, key: string): string => {
    return CryptoJS.AES.encrypt(password, key).toString();
};

const decryptPasswordWithKey = (encryptedPassword: string, key: string): string => {
    return CryptoJS.AES.decrypt(encryptedPassword, key).toString(CryptoJS.enc.Utf8);
};
