import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email y password son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('usuarios')
      .insert([
        {
          name,
          email,
          passw_hash: hashedPassword,
        },
      ]);

    if (error) {
      return res.status(500).json({ message: 'Error al registrar usuario' });
    }

    return res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y password son requeridos' });
  }

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id_user, email, passw_hash')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passw_hash);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id_user: user.id_user },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
