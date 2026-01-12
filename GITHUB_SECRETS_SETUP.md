# Configuración de Secretos para GitHub Actions

Para que el CI/CD funcione correctamente y conecte el Frontend con los APIs, necesitas agregar los siguientes secretos en tu repositorio de GitHub:

## 📋 Pasos para Agregar Secretos

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Haz clic en "New repository secret"
4. Agrega cada uno de los secretos que se indican abajo

## 🔑 Secretos Requeridos

### Para Desarrollo (rama `dev`)

- **`GCP_PROJECT_ID`**: El ID de tu proyecto de Google Cloud (ej: `ponti-918612125172`)
- **`GCP_SA_KEY`**: Tu JSON key de la cuenta de servicio de Google Cloud (archivo completo)
- **`DEV_API_URL`**: URL del servicio `ponti-api-dev` en Cloud Run
  - Ejemplo: `https://ponti-api-dev-918612125172.us-central1.run.app`
- **`DEV_AUTH_API_URL`**: URL del servicio `auth-api-dev` en Cloud Run (si es diferente)
  - Ejemplo: `https://auth-api-dev-918612125172.us-central1.run.app`

### Para Producción (rama `main`)

- **`PROD_GCP_PROJECT_ID`**: El ID de tu proyecto de Google Cloud para Producción
- **`PROD_WIF_PROVIDER`**: Provider de Workload Identity Federation (para producción)
- **`PROD_SERVICE_ACCOUNT`**: Service Account para Producción
- **`PROD_API_URL`**: URL del servicio `ponti-api-prod` en Cloud Run
- **`PROD_AUTH_API_URL`**: URL del servicio `auth-api-prod` en Cloud Run

## 🔍 Cómo Encontrar las URLs de Cloud Run

1. Ve a Google Cloud Console
2. Busca "Cloud Run"
3. Para cada servicio (ponti-api-dev, auth-api-dev, etc.), haz clic en el nombre
4. En la parte superior, verás la URL. Cópiala completamente (incluye `https://`)
5. Agrega esa URL como secreto en GitHub

## 📝 Ejemplo de URL de Cloud Run

```
https://ponti-api-dev-918612125172.us-central1.run.app
```

## ✅ Verificación

Después de agregar los secretos, puedes verificar que funcionan:

1. Haz un commit a la rama `dev`
2. GitHub Actions ejecutará automáticamente el flujo de CI/CD
3. En la pestaña "Actions", verás el progreso
4. Si algo falla, haz clic en el job para ver los logs detallados

## 🚀 ¿Qué Sucede Después?

Cuando el deployment sea exitoso:

1. Tu Frontend se construirá con las variables `VITE_API_URL` y `VITE_AUTH_API_URL` inyectadas
2. En el navegador, los requests irán a las URLs de Cloud Run en lugar de localhost
3. El Frontend se desplegará en Cloud Run como servicio `ui-app-dev`

## 🆘 Troubleshooting

Si algo falla, revisa:

- ✅ ¿Los secretos están correctamente nombrados?
- ✅ ¿Las URLs de Cloud Run son correctas y accesibles?
- ✅ ¿El JSON key de GCP es válido?
- ✅ ¿Los servicios de Cloud Run están activos?
