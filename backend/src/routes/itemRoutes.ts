import express from "express";
import { addItem, getItems, deleteItem, editItem } from "../controllers/itemControllers";
import { authenticateToken } from "../middleware/authentication";

const router = express.Router();

router.post("/add", authenticateToken, addItem);
router.post("/edit", authenticateToken, getItems);
router.delete("/delete", authenticateToken, deleteItem);
router.put("/edit", authenticateToken, editItem);

export default router;
