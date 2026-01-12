# 🏆 El Triplete Verde + La Solución Final

## 🟢🟢🟢 El Triplete Verde (Los 3 Microservicios en Cloud Run)

```
┌─────────────────────────────────────────────────────┐
│                  CLOUD RUN SERVICIOS                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🟢 ui-app-dev                                      │
│     URL: https://ui-app-dev-XXXXX.run.app          │
│     ├─ Frontend (React/Vite)                       │
│     └─ Express Server (proxy)                      │
│                                                     │
│  🟢 ponti-api-dev                                   │
│     URL: https://ponti-api-dev-918612125172...     │
│     └─ Backend API Principal                       │
│                                                     │
│  🟢 auth-api-dev (o integrado en ponti-api)        │
│     URL: https://auth-api-dev-918612125172...      │
│     └─ Backend API Autenticación                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🕵️ El Misterio del Error 500

### Antes (Lo que estaba pasando):

```
Usuario abre Login en https://ui-app-dev-XXXXX.run.app
          ↓
React hace POST a /api/auth/login
          ↓
Express (en ui-app-dev) recibe la petición
          ↓
Express busca: process.env.AUTH_API_URL
          ↓
❌ Variable NO EXISTE (no fue inyectada)
          ↓
Express intenta conectar a: undefined o localhost
          ↓
💥 Error 500 Internal Server Error
```

### Ahora (La Solución):

```
Usuario abre Login en https://ui-app-dev-XXXXX.run.app
          ↓
React hace POST a /api/auth/login
          ↓
Express (en ui-app-dev) recibe la petición
          ↓
Express busca: process.env.AUTH_API_URL
          ↓
✅ Variable EXISTE: https://auth-api-dev-918612125172.run.app
          ↓
Express reenvía la petición a Auth API
          ↓
Auth API valida credenciales
          ↓
✅ Retorna: access_token + refresh_token
          ↓
Express recibe la respuesta
          ↓
Express reenvia la respuesta a React
          ↓
React almacena tokens
          ↓
✅ Usuario logueado
```

---

## 🔧 El Cambio que Hicimos

### Archivo: `.github/workflows/deploy-to-cloudrun.yml`

#### Antes:
```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ env.SERVICE_NAME }} \
      --image=${{ steps.build.outputs.image }} \
      --region=${{ env.REGION }} \
      --platform=managed \
      --allow-unauthenticated \
      --quiet
```

#### Ahora:
```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ env.SERVICE_NAME }} \
      --image=${{ steps.build.outputs.image }} \
      --region=${{ env.REGION }} \
      --platform=managed \
      --allow-unauthenticated \
      --quiet \
      --set-env-vars="\
      NODE_ENV=production,\
      VITE_API_URL=${{ env.API_URL }},\
      VITE_AUTH_API_URL=${{ env.AUTH_API_URL }},\
      API_URL=${{ env.API_URL }},\
      AUTH_API_URL=${{ env.AUTH_API_URL }}"
```

### ¿Qué significa `--set-env-vars`?

Le dice a Cloud Run: "Cuando inicies este servicio, establece estas variables de entorno".

```
NODE_ENV=production
  └─ Le dice a Express que está en producción

VITE_API_URL=https://ponti-api-dev-918612125172.run.app
  └─ Para el navegador (React/Vite)

VITE_AUTH_API_URL=https://auth-api-dev-918612125172.run.app
  └─ Para el navegador (Auth separado)

API_URL=https://ponti-api-dev-918612125172.run.app
  └─ Para Express (proxy de API)

AUTH_API_URL=https://auth-api-dev-918612125172.run.app
  └─ Para Express (proxy de Auth)
```

---

## 📊 Las 3 Capas de Variables de Entorno

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESARROLLO LOCAL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Variables de entorno: Ninguna necesaria                        │
│  Vite automáticamente usa: http://localhost:3000/api            │
│  Express automáticamente usa: http://localhost:3000             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD TIME (Docker)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  --build-arg VITE_API_URL=...                                   │
│  --build-arg VITE_AUTH_API_URL=...                              │
│                                                                 │
│  ↓ Estas se "cocinan" en el HTML/JS                             │
│  ↓ Vite las reemplaza en el build                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME (Cloud Run)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  --set-env-vars NODE_ENV=production                             │
│  --set-env-vars API_URL=...                                     │
│  --set-env-vars AUTH_API_URL=...                                │
│                                                                 │
│  ↓ Estas están disponibles cuando Express inicia                │
│  ↓ Express puede usarlas para saber dónde redirigir requests    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Flujo Completo Ahora

```
GitHub (rama dev)
     ↓ push
     ↓
GitHub Actions dispara CI/CD
     ↓
┌─ Detecta ambiente: dev
├─ Lee secretos: DEV_API_URL, DEV_AUTH_API_URL
│
├─ BUILD STAGE (Docker)
│  └─ docker build --build-arg VITE_API_URL=...
│     └─ Vite compila con URLs inyectadas
│        └─ El HTML/JS contiene URLs reales
│
├─ PUSH (Artifact Registry)
│  └─ docker push us-central1-docker.pkg.dev/...
│
└─ DEPLOY STAGE (Cloud Run)
   └─ gcloud run deploy
      ├─ --image=[la que acabamos de pushear]
      └─ --set-env-vars API_URL=..., AUTH_API_URL=...
         └─ Cloud Run inicia el servicio
            └─ Express tiene las variables disponibles en process.env
               └─ Express puede proxy requests a los APIs reales
                  └─ ✅ TODO FUNCIONA
```

---

## ✅ Verificación: ¿Funciona Ahora?

### En el Navegador:

```javascript
// DevTools Console
debugFrontend.showEnvVars()

// Debería mostrar:
// VITE_API_URL: https://ponti-api-dev-918612125172.run.app
// VITE_AUTH_API_URL: https://auth-api-dev-918612125172.run.app
```

### Cuando Hagas Login:

```javascript
// DevTools → Network
// Verifica que:
// 1. Request va a: /api/auth/login (al mismo ui-app-dev)
// 2. Express reenvia internamente a: https://auth-api-dev-918612125172.run.app/auth/login
// 3. La respuesta contiene: access_token
// 4. Status: 200 OK (no 500 Error)
```

### En Cloud Run Logs:

```bash
gcloud run logs read ui-app-dev --region=us-central1 --tail=50

# Debería mostrar algo como:
# INFO: Starting Express server
# INFO: NODE_ENV=production
# INFO: API_URL=https://ponti-api-dev-918612125172.run.app
# INFO: AUTH_API_URL=https://auth-api-dev-918612125172.run.app
# INFO: Server listening on port 3000
```

---

## 📋 Resumen: Los 3 Cambios Críticos

| Cambio | Cuándo | Para Quién | Resultado |
|--------|--------|-----------|-----------|
| **GitHub Secrets** | Pre-deployment | CI/CD | CI/CD sabe las URLs |
| **--build-arg en Docker** | Build time | Vite/Navegador | Frontend sabe las URLs |
| **--set-env-vars en Cloud Run** | Runtime | Express | Express sabe las URLs |

---

## 🎯 Ahora Haz Esto:

1. **GitHub Actions está corriendo ahora** (check Actions tab)
2. **Espera a que termine** (10-15 minutos)
3. **Abre el Frontend en Cloud Run**
4. **Prueba login**
5. **Si funciona**: 🎉 ¡Ganaste!
6. **Si falla**: Revisa Cloud Run logs para el error específico

---

## 💡 ¿Por Qué Pasó Todo Esto?

Tu arquitectura es "monolítica en Cloud Run" (Frontend + Express juntos), pero llamando a APIs separadas:

```
Cliente (Navegador)
  ├─ HTML/CSS/JS (compilados)
  ├─ React (cliente)
  └─ Hace requests a /api
       ↓
     Express (servidor Node.js)
       ├─ Sirve el HTML/CSS/JS
       ├─ Proxy de /api → APIs reales
       └─ Necesita saber dónde están las APIs (variables ENV)
            ↓
          ponti-api-dev (Backend)
          auth-api-dev (Auth)
```

Sin `--set-env-vars`, Express no sabía dónde redirigir → Error 500.

Con `--set-env-vars`, Express sabe exactamente dónde ir → ✅ Funciona.

---

**Estado**: ✅ DEPLOYMENT ACTUALIZADO Y LISTO
**Cambio**: Agregado `--set-env-vars` al deploy
**Commits**: 1 nuevo
**Próximo**: Esperar a que GitHub Actions termineando y probar
