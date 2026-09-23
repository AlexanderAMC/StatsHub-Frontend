# StatsHub Frontend

Frontend oficial de la plataforma StatsHub Deportivo.

---

# Tecnologías

- React
- Vite
- React Router DOM
- Axios
- PWA

---

# Requisitos

- Node.js 22+
- npm 10+
- Git

---

# Instalación

Clonar repositorio:

```bash
git clone https://github.com/AlexanderAMC/StatsHub-Frontend.git
```

Entrar al proyecto:

```bash
cd StatsHub-Frontend
```

Instalar dependencias:

```bash
npm install
```

---

# Configuración

Crear archivo:

```env
.env
```

Ejemplo:

```env
VITE_API_URL=http://localhost:5000
```

⚠ Nunca subir el archivo `.env` al repositorio.

---

# Ejecución

Iniciar servidor:

```bash
npm run dev
```

Acceder:

```txt
http://localhost:5173
```

---

# Compilación

```bash
npm run build
```

---

# Pruebas

Ejecutar pruebas:

```bash
npm test
```

Modo observación:

```bash
npm run test:watch
```

Cobertura:

```bash
npm run test:coverage
```

---

# Estructura de ramas

```txt
main
develop

feature/AlexanderMendez
feature/DanielBalcarce
feature/JuanVillagran
feature/DanielPincheira
```

---

# Reglas del Equipo

NO trabajar directamente en:

```txt
main
develop
```

Cada integrante debe trabajar exclusivamente en su rama personal.

---

# Flujo de Trabajo

Actualizar develop:

```bash
git checkout develop

git pull origin develop
```

Cambiar a tu rama:

```bash
git checkout feature/TuNombre
```

Actualizar rama:

```bash
git merge develop
```

Subir cambios:

```bash
git add .

git commit -m "feat: descripción"

git push
```

---

# Pull Request

Todos los Pull Request deben apuntar a:

```txt
develop
```

Nunca directamente a:

```txt
main
```

El Pull Request debe contener:

- Objetivo
- Cambios realizados
- Evidencia visual (si aplica)
- Posibles riesgos

Checklist obligatorio:

- [ ] Compila correctamente
- [ ] Probado localmente
- [ ] No contiene credenciales
- [ ] Documentación actualizada

---

# Convención de Commits

```txt
feat:
fix:
docs:
style:
refactor:
test:
```

Ejemplos:

```txt
feat: pantalla login

fix: validacion formulario

docs: actualizacion readme
```

---

# Prohibido

❌ Push directo a main

❌ Push directo a develop

❌ Modificar ramas de otros integrantes

❌ Subir .env

❌ Subir credenciales

❌ Subir claves AWS

❌ Modificar arquitectura sin consenso

---

# Objetivo

Desarrollar la interfaz PWA de StatsHub Deportivo utilizando buenas prácticas de React y diseño Mobile First.