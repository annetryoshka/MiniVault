// controllers/credentialsController.js
import pool from "../config/db.js";
import crypto from "crypto";

const AES_KEY = process.env.AES_KEY; // debe tener 32 bytes
const IV_LENGTH = 16;

function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(AES_KEY),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export async function getCredentials(req, res) {
  const userId = req.user?.id_user;
  const search = req.query.search;

  try {
    let query = pool
      .from("credenciales")
      .select("id_c, id_user, service, account_username, url, notas, created_date, update_date")
      .eq("id_user", userId);

    if (search) {
      query = query.ilike("service", `%${search}%`);
    }

    const { data, error } = await query.order("created_date", { ascending: false });

    if (error) return res.status(500).json({ message: error.message });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createCredential(req, res) {
  const userId = req.user?.id_user;
  const { service, account_username, passw_encr, url, notas } = req.body;

  try {
    const { data, error } = await pool
      .from("credenciales")
      .insert([{ id_user: userId, service, account_username, passw_encr, url, notas }])
      .select("id_c, service, account_username, url, created_date")
      .single();

    if (error) return res.status(500).json({ message: error.message });

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getCredentialById(req, res) {
  const userId = req.user?.id_user;
  const { id } = req.params;

  try {
    const { data, error } = await pool
      .from("credenciales")
      .select("id_c, id_user, service, account_username, url, notas, created_date, update_date")
      .eq("id_c", id)
      .eq("id_user", userId)
      .single();

    if (error || !data) return res.status(404).json({ message: "Credential not found" });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateCredential(req, res) {
  const userId = req.user?.id_user;
  const { id } = req.params;
  const { service, account_username, url, notas } = req.body;

  try {
    const { data, error } = await pool
      .from("credenciales")
      .update({ service, account_username, url, notas })
      .eq("id_c", id)
      .eq("id_user", userId)
      .select("id_c, id_user, service, account_username, url, notas, created_date, update_date")
      .single();

    if (error || !data) return res.status(404).json({ message: "Credential not found" });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteCredential(req, res) {
  const userId = req.user?.id_user;
  const { id } = req.params;

  try {
    const { data, error } = await pool
      .from("credenciales")
      .delete()
      .eq("id_c", id)
      .eq("id_user", userId)
      .select("id_c")
      .single();

    if (error || !data) return res.status(404).json({ message: "Credential not found" });

    return res.json({ message: "Credential deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function revealCredential(req, res) {
  const userId = req.user?.id_user;
  const { id } = req.params;

  try {
    const { data, error } = await pool
      .from("credenciales")
      .select("id_c, passw_encr")
      .eq("id_c", id)
      .eq("id_user", userId)
      .single();

    if (error || !data) return res.status(404).json({ message: "Credential not found" });

    const decryptedPassword = decrypt(data.passw_encr);

    // Registrar auditoría
    await pool.from("audit_logs").insert([{ id_user: userId, id_credential: id, action: "SHOW_PASSWORD" }]);

    return res.json({ password: decryptedPassword });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}