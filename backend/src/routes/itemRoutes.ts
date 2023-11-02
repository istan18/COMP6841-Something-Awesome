import express from "express";
import { addItem, getItems, deleteItem, editItem } from "../controllers/itemControllers";
import { authenticateToken } from "../middleware/authentication";

const router = express.Router();

router.post("/add", authenticateToken, addItem);
router.post("/get", authenticateToken, getItems);
router.delete("/delete/:name", authenticateToken, deleteItem);
router.put("/edit/:name", authenticateToken, editItem);

export default router;
