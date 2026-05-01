# Reservas de Mesas

Aplicación web para reservar mesas. Permite:

- Seleccionar mesa, día, hora y duración
- Añadir usuarios a la reserva
- Gestionar reservas propias (crear, cancelar, ver)
- Visualizar franjas horarias ocupadas de cada mesa
- Login con Google
- Roles: usuario y admin (el admin gestiona las mesas)

## Tecnologías

- **Backend:** Node.js (Express)
- **Base de datos:** MongoDB
- **Frontend:** React + Material UI
- **Autenticación:** Google OAuth

## Instalación y ejecución

1. Clona el repositorio y entra en la carpeta del proyecto.
2. **Si usas VS Code Dev Containers:**
   - Abre la carpeta en VS Code y selecciona "Reopen in Container".
   - MongoDB se levantará automáticamente en el contenedor `mongo` (puerto 27017).
3. **Si NO usas Dev Containers:**
   - Instala dependencias:
     - Backend: `cd backend && npm install`
     - Frontend: `cd frontend && npm install`
   - Asegúrate de tener MongoDB corriendo localmente (o usa Docker).
4. Configura las variables de entorno:
   - Copia `.env.example` a `.env` en `/backend` y `/frontend` y rellena los valores necesarios.
   - Ejemplo backend:

     ```env
     GOOGLE_CLIENT_ID=... (de Google Cloud)
     GOOGLE_CLIENT_SECRET=...
     GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
     MONGO_URI=mongodb://localhost:27017/reservas
     SESSION_SECRET=alguna_clave_segura
     ```

   - Ejemplo frontend:

     ```env
     REACT_APP_API_URL=http://localhost:4000
     ```

5. Arranca el backend:
   - `cd backend && npm run dev`
6. Arranca el frontend:
   - `cd frontend && npm start`
7. Accede a `http://localhost:3000` en tu navegador.

## Estructura del proyecto

- `/backend` - API Express, modelos y rutas
- `/frontend` - Aplicación React

## Roles y permisos

- **Usuario:** puede reservar, ver y cancelar sus reservas, añadir otros usuarios a una reserva.
- **Admin:** además puede crear, editar y eliminar mesas.

## Notas

- El primer usuario debe ser marcado como admin manualmente en la base de datos (o cambia el rol en MongoDB).
- El sistema de reservas impide solapamientos en la misma mesa y franja horaria si alguna reserva se marca como "mesa completa".

---

Desarrollado por JevyanJ.
