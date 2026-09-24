# StatsHub Frontend - Guía de Instalación

## Descripción

Este documento describe el proceso de instalación y configuración del entorno de desarrollo para StatsHub Frontend.

---

# Requisitos Previos

Antes de comenzar, verificar que las siguientes herramientas estén instaladas.

## Node.js

Versión oficial del proyecto:

```text
22.19.0
```

Verificar instalación:

```bash
node -v
```

Resultado esperado:

```text
v22.19.0
```

---

## npm

Verificar instalación:

```bash
npm -v
```

Resultado esperado:

```text
10.9.3
```

---

## Git

Verificar instalación:

```bash
git --version
```

Resultado esperado:

```text
git version 2.x
```

---

## Visual Studio Code

Utilizar la versión más reciente disponible.

---

# Clonar el Repositorio

```bash
git clone https://github.com/TU_ORGANIZACION/StatsHub-Frontend.git
```

Ingresar al proyecto:

```bash
cd StatsHub-Frontend
```

---

# Instalación de Dependencias

Instalar todas las dependencias del proyecto:

```bash
npm install
```

---

# Dependencias Oficiales

Las versiones utilizadas en el proyecto deben mantenerse sincronizadas para evitar problemas de compatibilidad.

## React

```bash
npm install react@19.1.1 react-dom@19.1.1
```

## React Router

```bash
npm install react-router-dom@7.8.2
```

## Axios

```bash
npm install axios@1.11.0
```

## Material UI

```bash
npm install @mui/material@7.3.2
npm install @emotion/react@11.14.0
npm install @emotion/styled@11.14.1
```

## SweetAlert2

```bash
npm install sweetalert2@11.23.0
```

## Chart.js

```bash
npm install chart.js@4.5.0
npm install react-chartjs-2@5.3.0
```

---

# Ejecución del Proyecto

Levantar servidor de desarrollo:

```bash
npm run dev
```

---

# Compilación para Producción

```bash
npm run build
```

---

# Vista Previa de Producción

```bash
npm run preview
```

---

# Pruebas

Ejecutar pruebas:

```bash
npm run test
```

---

# Actualización del Proyecto

Después de obtener cambios del repositorio:

```bash
git pull origin develop
```

Instalar dependencias nuevas:

```bash
npm install
```

---

# Estructura de Ramas

No realizar commits directamente sobre:

```text
main
```

ni sobre:

```text
develop
```

Cada integrante trabajará exclusivamente en su rama asignada:

```text
feature-AlexanderMendez
feature-DanielPincheira
feature-NombreIntegrante
```

---

# Reglas de Dependencias

No ejecutar:

```bash
npm update
```

No ejecutar:

```bash
npm install paquete@latest
```

Sin aprobación del líder del proyecto.

---

# Archivos Importantes

Nunca eliminar:

```text
package.json
```

```text
package-lock.json
```

```text
.nvmrc
```

---

# Instalación Inicial para Nuevos Integrantes

Ejecutar los siguientes comandos:

```bash
git clone URL_DEL_REPOSITORIO
```

```bash
cd StatsHub-Frontend
```

```bash
npm install
```

```bash
npm run dev
```

---

# Soporte

Si existe algún error relacionado con dependencias:

1. Eliminar node_modules.
2. Eliminar package-lock.json.
3. Ejecutar nuevamente:

```bash
npm install
```

---

# Versiones Oficiales

| Herramienta | Versión |
|------------|----------|
| Node.js | 22.19.0 |
| npm | 10.9.3 |
| React | 19.1.1 |
| React DOM | 19.1.1 |
| React Router DOM | 7.8.2 |
| Axios | 1.11.0 |
| Material UI | 7.3.2 |
| SweetAlert2 | 11.23.0 |
| Chart.js | 4.5.0 |
| react-chartjs-2 | 5.3.0 |