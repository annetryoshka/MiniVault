const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name ||!email || !password) {
      return res.status(400).json({ message: 'Nombre, Email y contraseña son requeridos' });
    }

    // Verificar si ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Usuario ya existe' });
    }

    // Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('usuarios')
      .insert([
        {
          name,
          email,
          passw_hash: hashedPassword,
          created_at: new Date()
        }
      ]);

    if (error) throw error;

    res.status(201).json({ message: 'Usuario creado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error en registro', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.passw_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id_user, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Error en inicio de sesión', error: error.message });
  }
};

module.exports = { register, login };