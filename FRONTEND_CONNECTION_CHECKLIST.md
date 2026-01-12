# ✅ Checklist: Conectar Frontend con APIs

Este checklist te guía paso a paso para conectar tu Frontend con los APIs en Cloud Run.

## 📋 Paso 1: Obtener las URLs de Cloud Run

- [ ] 1. Accede a [Google Cloud Console](https://console.cloud.google.com)
- [ ] 2. Navega a **Cloud Run**
- [ ] 3. Para cada servicio, copia la URL:
  - [ ] 3.1 `ponti-api-dev` → URL: `________________`
  - [ ] 3.2 `auth-api-dev` → URL: `________________`
  - [ ] 3.3 (Opcional) Otros servicios → URL: `________________`

## 📝 Paso 2: Agregar Secretos en GitHub

- [ ] 4. Abre tu repositorio en GitHub
- [ ] 5. Ve a **Settings → Secrets and variables → Actions**
- [ ] 6. Haz clic en **New repository secret** y agrega:

```
Nombre: DEV_API_URL
Valor: [URL de ponti-api-dev copiada arriba]
```

- [ ] 7. Repite para `DEV_AUTH_API_URL`:

```
Nombre: DEV_AUTH_API_URL
Valor: [URL de auth-api-dev copiada arriba]
```

- [ ] 8. Verifica que ambos secretos están creados

## 🐳 Paso 3: Verificar Dockerfile

- [ ] 9. Abre el archivo [Dockerfile](Dockerfile)
- [ ] 10. Confirma que la sección de `ui-builder` incluye:

```dockerfile
ARG VITE_API_URL
ARG VITE_AUTH_API_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
```

✅ Si no está, revisa [Este archivo es actualizado automáticamente]

## 🔄 Paso 4: Verificar Deploy Workflow

- [ ] 11. Abre [.github/workflows/deploy-to-cloudrun.yml](.github/workflows/deploy-to-cloudrun.yml)
- [ ] 12. Confirma que el paso "Build and Push" incluye:

```yaml
docker build \
  --build-arg VITE_API_URL="${{ env.API_URL }}" \
  --build-arg VITE_AUTH_API_URL="${{ env.AUTH_API_URL }}" \
  -t $IMAGE .
```

✅ Si no está, revisa [Este archivo es actualizado automáticamente]

## 🚀 Paso 5: Hacer un Deployment

- [ ] 13. Haz un commit a la rama `dev`:
  ```bash
  git add .
  git commit -m "ci: configure frontend api urls"
  git push origin dev
  ```

- [ ] 14. Ve a la pestaña **Actions** en GitHub
- [ ] 15. Observa que el workflow `CI/CD Pipeline` está corriendo
- [ ] 16. Espera a que termine (debería tardar ~10-15 minutos)

## ✅ Paso 6: Verificar el Deployment

- [ ] 17. Si el workflow fue **exitoso**, ve a **Cloud Run**
- [ ] 18. Abre el servicio `ui-app-dev`
- [ ] 19. Copia la URL del Frontend
- [ ] 20. Abre la URL en tu navegador
- [ ] 21. Abre las **DevTools (F12) → Console**
- [ ] 22. Ejecuta:
  ```javascript
  console.log('API URL:', import.meta.env.VITE_API_URL);
  console.log('Auth URL:', import.meta.env.VITE_AUTH_API_URL);
  ```
- [ ] 23. Verifica que muestre las URLs de Cloud Run (no localhost)

## 🔗 Paso 7: Probar la Conexión

- [ ] 24. En el navegador, realiza una acción que haga una request a la API (ej: login, cargar un listado)
- [ ] 25. Abre **DevTools → Network**
- [ ] 26. Verifica que los requests van a las URLs correctas de Cloud Run

## 🎯 Paso 8: Troubleshooting (si algo no funciona)

Si los requests aún van a localhost o fallan:

- [ ] 27. ¿Los secretos en GitHub están correctamente nombrados? (`DEV_API_URL`, `DEV_AUTH_API_URL`)
- [ ] 28. ¿Las URLs en los secretos son correctas y accesibles?
- [ ] 29. ¿El workflow completó exitosamente? (verifica en Actions)
- [ ] 30. ¿Los servicios en Cloud Run están activos y no en error?
- [ ] 31. ¿El CORS está configurado correctamente en el Backend?

Prueba ejecutar manualmente el workflow:
- [ ] 32. En la pestaña **Actions**, selecciona el workflow
- [ ] 33. Haz clic en **Run workflow → Run workflow**
- [ ] 34. Observa los logs si hay errores

## 📊 Resumen: ¿Qué Sucedió?

```
GitHub Secrets (DEV_API_URL, DEV_AUTH_API_URL)
    ↓
GitHub Actions Workflow Lee los Secretos
    ↓
Docker build con --build-arg VITE_API_URL=$DEV_API_URL
    ↓
Vite Inyecta Variables en el Build
    ↓
Frontend Compilado Contiene las URLs de Cloud Run
    ↓
Desplegado en Cloud Run
    ↓
Cuando el Usuario Abre la App → Los Requests van a Cloud Run ✅
```

## 🎉 ¿Listo?

Si todos los checkboxes están marcados y los requests van a las URLs de Cloud Run, **¡felicidades!** Tu Frontend está correctamente conectado con tus APIs.

---

**Preguntas frecuentes**: Ver [FRONTEND_ENV_VARS.md](FRONTEND_ENV_VARS.md)

**Más información**: Ver [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)
