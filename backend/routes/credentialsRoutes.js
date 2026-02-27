import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  getCredentials,
  createCredential,
  getCredentialById,
  updateCredential,
  deleteCredential,
} from "../controllers/credentialsController.js";

const router = express.Router();

router.get("/", authenticateToken, getCredentials);
router.post("/", authenticateToken, createCredential);
router.get("/:id", authenticateToken, getCredentialById);
router.put("/:id", authenticateToken, updateCredential);
router.delete("/:id", authenticateToken, deleteCredential);

export default router;

