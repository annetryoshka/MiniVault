# Mini Vault 
Página para el registro y autenticación de usuarios con
React +  Typescript para el frontend, con el objetivo de permitir a
los usuarios guardar credenciales de servicios en línea (ej. Netflix, Disney+, Spotify) en una
agenda digital.

# Stack Tecnológico
- React
- Vite
- Typescript
- Tailwind CSS
- Supabase
 
# Estructura del frontend
```
MINIVAULT/

    src/

        components/        # Componentes reutilizables
        hooks/             # Custom hooks
        integrations/      # Conexión con la api
        lib/               # Utilidades y helpers
        pages/             # Páginas principales
        test/              # Tests

        App.tsx
        main.tsx
        App.css
        index.css
        vite-env.d.ts

    supabase/              # Configuración Supabase
    .env                   # Variables de entorno
    tailwind.config.ts     # Configuración Tailwind
    postcss.config.js
    eslint.config.js
    tsconfig.app.json
    index.html
    package.json
```

# Backend API

Express API para autenticación y registro de usuarios, y CRUD de credenciales.

# Base de datos
 
Supabase para la base de datos relacional con postgreSQL
Tablas:
- Usuarios
- Credenciales
- Audit_logs

# Variables de entorno (.env)
- PORT
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- ENCRYPTION_KEY

# Estructura del backend

```
backend/

    src/

        config/         # Configuraciones
        controllers/
        middlewares/
        route/          # Definición de rutas

    .env.example        # Ejemplo de variables de entorno
    package.json
    package-lock.json
    server.js           # Punto de entrada del servidor
    README.md
```

# Run
- npm install
- npm run dev
