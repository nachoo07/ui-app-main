# 🏗️ Arquitectura: Frontend ↔ APIs

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DESARROLLO LOCAL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Frontend (localhost:5173)         API Local (localhost:3000)              │
│  ┌──────────────────────┐          ┌─────────────────────┐                │
│  │ Vite Dev Server      │          │ Backend Server      │                │
│  │ (Hot Reload)         │──────────│ (Node.js/Express)   │                │
│  │                      │ /api     │                     │                │
│  │ Variables:           │          │ Conecta a DB        │                │
│  │ - VITE_API_URL: vacio │         │ - Redis             │                │
│  │   (usa localhost)    │          │ - MongoDB/SQL       │                │
│  └──────────────────────┘          └─────────────────────┘                │
│         ↓                                    ↓                             │
│    DevTools (F12)              API Responses                              │
│    Red requests a /api         (JSON)                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCCIÓN (Cloud Run)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                GitHub Repository (rama: dev)                               │
│                          ↓                                                  │
│                  GitHub Actions Triggered                                  │
│                   (on push to dev)                                         │
│                          ↓                                                  │
│           ┌─────────────────────────────┐                                  │
│           │ 1. Set Environment Config   │                                  │
│           │    Lee secretos de GitHub   │                                  │
│           │    - DEV_API_URL            │                                  │
│           │    - DEV_AUTH_API_URL       │                                  │
│           └─────────────────────────────┘                                  │
│                          ↓                                                  │
│           ┌─────────────────────────────┐                                  │
│           │ 2. Build with Docker       │                                  │
│           │    docker build \            │                                  │
│           │    --build-arg \             │                                  │
│           │    VITE_API_URL=...         │                                  │
│           │    --build-arg \             │                                  │
│           │    VITE_AUTH_API_URL=...    │                                  │
│           └─────────────────────────────┘                                  │
│                          ↓                                                  │
│           ┌─────────────────────────────┐                                  │
│           │ 3. Push to Container        │                                  │
│           │    Registry (Artifact       │                                  │
│           │    Registry en Google Cloud)│                                  │
│           └─────────────────────────────┘                                  │
│                          ↓                                                  │
│           ┌─────────────────────────────┐                                  │
│           │ 4. Deploy to Cloud Run      │                                  │
│           │    ui-app-dev               │                                  │
│           │    (servicio)               │                                  │
│           └─────────────────────────────┘                                  │
│                          ↓                                                  │
│           ┌──────────────────────────────────────────────────┐             │
│           │        Cloud Run (Public URL)                    │             │
│           │  https://ui-app-dev-XXXXX.run.app               │             │
│           │                                                   │             │
│           │  Frontend + Backend (monolítico)                 │             │
│           │  Variables inyectadas:                           │             │
│           │  - VITE_API_URL=https://ponti-api-dev-XXXXX...  │             │
│           │  - VITE_AUTH_API_URL=https://auth-api-dev-...   │             │
│           └──────────────────────────────────────────────────┘             │
│                          ↓                                                  │
│    Requests a APIs de Cloud Run (no localhost)                            │
│                          ↓                                                  │
│        ┌──────────────────────┐    ┌──────────────────────┐               │
│        │  ponti-api-dev       │    │  auth-api-dev        │               │
│        │  Cloud Run Service   │    │  Cloud Run Service   │               │
│        │  (Backend monolítico)│    │ (si separado)        │               │
│        └──────────────────────┘    └──────────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos: Request Típico

```
Usuario hace login en el Frontend
         ↓
POST /auth/login (desde el Frontend)
         ↓
¿Ambiente?
    ├─ DESARROLLO: Iría a http://localhost:3000/api/auth/login
    └─ PRODUCCIÓN: Iría a https://ponti-api-dev-XXXXX.run.app/auth/login
         ↓
Backend recibe request
         ↓
Autentica credenciales
         ↓
Retorna access_token + refresh_token
         ↓
Frontend almacena tokens (localStorage/sessionStorage)
         ↓
Siguientes requests incluyen: Authorization: Bearer [token]
         ↓
APIClient intercepta requests
  ├─ Si 401: Refresca token automáticamente
  └─ Si éxito: Retorna datos a la aplicación
```

## Variables Clave en Cada Stage

### 🔧 Desarrollo Local
```
Archivo: ui/.env (no está en repo)
VITE_API_URL=        (vacío, usa default)
VITE_AUTH_API_URL=   (vacío, usa default)

Default en apiInstance.ts:
- DEV: http://localhost:3000/api
- PROD: /api (si fuera en el mismo servidor)
```

### 🏗️ Build Stage (Docker)
```
Dockerfile lee arguments:
ARG VITE_API_URL
ARG VITE_AUTH_API_URL

Y los convierte a ENV:
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL

Estos se inyectan en el build de Vite
```

### 🚀 GitHub Actions
```
Secretos de GitHub:
- DEV_API_URL=https://ponti-api-dev-918612125172.us-central1.run.app
- DEV_AUTH_API_URL=https://auth-api-dev-918612125172.us-central1.run.app

Pasados a Docker:
docker build --build-arg VITE_API_URL=${{ env.API_URL }}
```

### ☁️ Cloud Run Runtime
```
Variables ya están inyectadas en el HTML/JS
Cuando el usuario abre la app:
- import.meta.env.VITE_API_URL = valor real
- import.meta.env.VITE_AUTH_API_URL = valor real

Los requests van directamente a Cloud Run
```

## ¿Qué Cambios Hice?

### 1️⃣ Dockerfile
- Agregué `ARG` para aceptar variables de build
- Agregué `ENV` para pasarlas a Vite

### 2️⃣ GitHub Actions Workflow
- Actualicé para leer secretos (`DEV_API_URL`, `DEV_AUTH_API_URL`)
- Pasé las variables como `--build-arg` en Docker

### 3️⃣ apiInstance.ts
- Agregué función `getApiBaseUrl()` que detecta variables de Vite
- Usa URLs de Cloud Run si están disponibles
- Fallback a localhost en desarrollo

### 4️⃣ main.tsx
- Importa módulo de debug en modo desarrollo
- Permite ver variables y testear APIs desde console

## Próximos Pasos

1. **Obtén las URLs de Cloud Run**
   - Ve a Google Cloud Console → Cloud Run
   - Copia las URLs de tus servicios

2. **Agrega Secretos en GitHub**
   - Settings → Secrets → New Repository Secret
   - `DEV_API_URL`, `DEV_AUTH_API_URL`

3. **Haz un Push a `dev`**
   ```bash
   git add .
   git commit -m "ci: setup frontend api urls"
   git push origin dev
   ```

4. **Verifica el Deployment**
   - Abre Actions en GitHub
   - Espera a que termine
   - Abre la URL de Cloud Run del Frontend

5. **Prueba la Conexión**
   - Abre DevTools (F12)
   - Ejecuta `debugFrontend.showEnvVars()`
   - Ejecuta `debugFrontend.testApiConnection()`

## Documentación Relacionada

- [FRONTEND_CONNECTION_CHECKLIST.md](FRONTEND_CONNECTION_CHECKLIST.md) - Paso a paso
- [FRONTEND_ENV_VARS.md](FRONTEND_ENV_VARS.md) - Detalles de variables
- [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) - Configuración de secretos
