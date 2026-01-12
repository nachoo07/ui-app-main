# Variables de Entorno del Frontend (Vite)

## ¿Cómo Funciona?

El Frontend (construido con **Vite**) necesita conocer las URLs de tus APIs para hacer requests. Vite inyecta estas variables en el momento del **build** (compilación), no en tiempo de ejecución.

## Variables Disponibles

### `VITE_API_URL`
- **Descripción**: URL base del API principal (ponti-api)
- **Formato**: `https://ponti-api-dev-XXXXX.us-central1.run.app`
- **Usado en**: Requests generales de la aplicación
- **Default (Desarrollo)**: `http://localhost:3000/api`

### `VITE_AUTH_API_URL`
- **Descripción**: URL base del API de autenticación (auth-api)
- **Formato**: `https://auth-api-dev-XXXXX.us-central1.run.app`
- **Usado en**: Requests de autenticación y refresh de tokens
- **Default (Desarrollo)**: Mismo que `VITE_API_URL`

## Cómo se Usan en el Código

En el archivo [ui/src/restclient/apiInstance.ts](ui/src/restclient/apiInstance.ts):

```typescript
// Vite automáticamente reemplaza import.meta.env.VITE_* con el valor real
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.DEV ? "http://localhost:3000/api" : "/api";
};
```

## Diferentes Valores Según el Ambiente

### 🔧 Desarrollo Local

- Las variables están **vacías** en `.env.development`
- Vite usa `http://localhost:3000/api` automáticamente
- Funciona con tu servidor local

### 🐳 Dentro de Docker (en producción)

Las variables se inyectan en el `Dockerfile` durante el build:

```dockerfile
ARG VITE_API_URL
ARG VITE_AUTH_API_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL

RUN npm run build
```

### ⚙️ En GitHub Actions

Se pasan como secretos y luego como `--build-arg` en Docker:

```yaml
docker build \
  --build-arg VITE_API_URL=${{ env.API_URL }} \
  --build-arg VITE_AUTH_API_URL=${{ env.AUTH_API_URL }} \
  -t $IMAGE .
```

## Archivos Relacionados

- 📄 [.github/workflows/deploy-to-cloudrun.yml](.github/workflows/deploy-to-cloudrun.yml) - Define cómo se pasan las variables en CI/CD
- 📄 [Dockerfile](Dockerfile) - Define cómo se inyectan en Docker
- 📄 [ui/.env.example](ui/.env.example) - Ejemplo de variables
- 📄 [ui/src/restclient/apiInstance.ts](ui/src/restclient/apiInstance.ts) - Cómo se usan en el código

## Verificar que Funciona

1. **En desarrollo local**: Abre las DevTools del navegador (F12) → Console
   - Haz una request: `await fetch("/api/health")`
   - Verifica que vaya a `http://localhost:3000/api/health`

2. **En producción (Cloud Run)**:
   - Abre DevTools → Network
   - Haz un login o cualquier acción
   - Verifica que los requests vayan a `https://ponti-api-dev-XXXXX.run.app` en lugar de localhost

## Troubleshooting

### ❌ Problema: "Cannot GET /api/..."

- Los requests siguen yendo a `/api` en lugar de las URLs de Cloud Run
- **Solución**: Las variables de entorno no se inyectaron correctamente durante el build

### ❌ Problema: "CORS error"

- El Frontend intenta conectar a la URL pero el CORS no está configurado
- **Solución**: Asegúrate que tu Backend tiene CORS habilitado para la URL del Frontend

### ❌ Problema: "404 - Page not found"

- La URL de Cloud Run no existe o el servicio no está activo
- **Solución**: Verifica en Google Cloud Console que los servicios están corriendo
