<div align="center">

# Servease — Frontend

**Plataforma para conectar proveedores de servicios con clientes.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ¿Qué es Servease?

Servease es una plataforma web moderna que conecta a **proveedores de servicios** con **clientes** que buscan contratar. Los usuarios pueden publicar servicios, explorar ofertas, comunicarse a través de mensajes directos y gestionar sus empleos activos, todo desde una interfaz fluida y responsiva.

---

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Registro, inicio de sesión y gestión de sesión con Supabase Auth |
| 🏠 **Home** | Vista principal personalizada para el usuario |
| 🔍 **Job Feed** | Exploración y búsqueda de servicios disponibles |
| 📋 **Mis Servicios** | Gestión de los servicios publicados por el usuario |
| 💼 **Mis Empleos** | Seguimiento de trabajos contratados o en progreso |
| ➕ **Nuevo Servicio** | Formulario animado para publicar un nuevo servicio |
| 💬 **Mensajes** | Sistema de mensajería entre usuarios |
| 👤 **Perfil** | Vista y edición del perfil del usuario |
| ⚙️ **Configuración** | Preferencias de cuenta, idioma y tema |

---

## 🧰 Stack tecnológico

### Core
- **[React 19](https://react.dev)** — UI declarativa con los últimos features del ecosistema
- **[TypeScript 6](https://www.typescriptlang.org)** — Tipado estático para mayor robustez
- **[Vite 8](https://vite.dev)** — Bundler ultrarrápido con HMR

### Estilos y UI
- **[Tailwind CSS 4](https://tailwindcss.com)** — Utilidades CSS de alto rendimiento
- **[Lucide React](https://lucide.dev)** — Íconos modernos y consistentes
- **[Motion](https://motion.dev)** — Animaciones fluidas y declarativas

### Routing e internacionalización
- **[React Router v7](https://reactrouter.com)** — Enrutamiento del lado del cliente
- **i18n personalizado** — Soporte multilenguaje (Español + extensible)

---

## 📁 Estructura del proyecto

```
src/
├── api/              # Llamadas a Supabase y lógica de datos
├── assets/           # Imágenes y recursos estáticos
├── components/       # Componentes reutilizables (sidebar, toast, tooltip...)
├── context/          # Contextos globales de React
├── i18n/             # Traducciones y configuración de idiomas
├── layouts/          # Layouts base de la aplicación
├── lib/              # Utilidades y configuración de librerías
├── router/           # Definición de rutas
├── screens/          # Pantallas principales (auth + app)
│   ├── auth/         # Login, registro
│   └── app/          # Home, Feed, Profile, etc.
├── styles/           # Estilos globales y animaciones CSS
└── theme/            # Configuración de tema (colores, dark mode)
```

---

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js `>=18`
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd Servease_Frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm run preview
```

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Análisis de código con ESLint |

---

<div align="center">

Creado por el equipo **AGA Studio**

</div>
