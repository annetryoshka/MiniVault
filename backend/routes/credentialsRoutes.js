// routes/credentialsRoutes.js
import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  getCredentials,
  createCredential,
  getCredentialById,
  updateCredential,
  deleteCredential,
  revealCredential
} from "../controllers/credentialsController.js";

const router = express.Router();

// Rutas para credenciales
router.get("/", authenticateToken, getCredentials);            // Obtener todas las credenciales
router.post("/", authenticateToken, createCredential);        // Crear nueva credencial
router.get("/:id", authenticateToken, getCredentialById);     // Obtener credencial por ID
router.put("/:id", authenticateToken, updateCredential);      // Actualizar credencial
router.delete("/:id", authenticateToken, deleteCredential);   // Eliminar credencial
router.get("/:id/reveal", authenticateToken, revealCredential); // Mostrar contraseña desencriptada

export default router;