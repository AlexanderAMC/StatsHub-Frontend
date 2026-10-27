# StatsHub Deportivo

Plataforma web de gestión y analítica deportiva: torneos, equipos y jugadores, calendario, actas digitales
en vivo, estadísticas y predicción. Proyecto de Título, INACAP sede Puente Alto, 2026.

## Tecnologías

- React 19 + Vite
- React Router (rutas) y React Bootstrap / Bootstrap 5 (interfaz)
- lucide-react (íconos)
- PWA instalable (manifest + service worker)
- Backend previsto: Node.js + Express, PostgreSQL, AWS (RDS, S3, EC2)

## Cómo ejecutarlo

```bash
npm install
npm install react-router-dom
npm run dev        # desarrollo
npm run build      # producción (aquí se activa el service worker)
npm run preview    # probar la versión de producción e instalar la PWA
npm run lint
```

## Roles y permisos

| Rol | Puede |
|---|---|
| Invitado (sin cuenta) | Ver marcadores, calendario, posiciones y estadísticas |
| Espectador / Jugador | Lo anterior y exportar reportes |
| Entrenador | Lo anterior y administrar el plantel de su equipo |
| Árbitro / Estadígrafo | Lo anterior y registrar actas |
| Organizador | Todo lo anterior, más torneos, equipos, transferencias, programación y fixture |
| Administrador | Todo, más usuarios y roles |

Las cuentas nuevas se crean como espectador. Cuentas de demostración en la pantalla de login.

## Estructura

```
src/
  components/   Layout, Sidebar, Header, notificaciones, modales
  pages/        Login, Dashboard, Torneos, Equipos, EquipoDetalle, JugadorDetalle,
                Calendario, Actas, Estadisticas, Usuarios
  context/      AuthProvider (sesión y cuentas), DataProvider (datos de la aplicación)
  hooks/        useAuth, useData
  data/         datos simulados, constantes, roles y permisos, menú
  utils/        estadísticas, predicción, fixture, fechas, exportación CSV
public/         manifest.webmanifest, sw.js, íconos
```

## Estado actual

Los datos son simulados y viven en memoria (se reinician al recargar). La sesión y las cuentas se guardan
en el navegador. El siguiente paso es reemplazar `DataProvider` y `AuthProvider` por llamadas a la API REST
(contraseñas con hash y token JWT, permisos verificados en el servidor).
