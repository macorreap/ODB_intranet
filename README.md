# Asistencia MJS

Aplicación web responsiva para marcar asistencia desde un código QR o ingreso manual de RUT. Busca el participante en Google Sheets y escribe `Presente` en la columna de la fecha seleccionada.

## Archivos principales

- `index.html`: pantalla de la aplicación.
- `styles.css`: diseño responsivo con identidad MJS y Oratorio.
- `app.js`: lector QR, fechas, normalización de RUT y envío a Google Sheets.
- `google-apps-script/Code.gs`: backend para pegar en Google Apps Script.
- `assets/`: logos usados en la interfaz.

## Conectar con Google Sheets

1. Abre la hoja de cálculo de Google.
2. Copia el ID de la hoja desde la URL. Es la parte entre `/d/` y `/edit`.
3. En Google Sheets, entra a `Extensiones > Apps Script`.
4. Pega el contenido de `google-apps-script/Code.gs`.
5. Cambia `SHEET_ID` por el ID real de la hoja.
6. Cambia `SHEET_NAME` si tu pestaña no se llama `Hoja 1`.
7. Publica en `Implementar > Nueva implementación > Aplicación web`.
8. Configura acceso según quién usará la app y copia la URL generada.
9. En `app.js`, reemplaza `PEGA_AQUI_LA_URL_DE_TU_WEB_APP` por esa URL.

## Uso

1. Abre la app desde un servidor local o una URL HTTPS.
2. Elige la fecha.
3. Inicia la cámara y escanea el QR, o escribe el RUT manualmente.
4. La app marcará `Presente` en la columna de la fecha seleccionada.

## Importante

La cámara del navegador solo funciona en `localhost` o en una URL segura `https://`. Si abres el archivo directamente con doble clic, algunos navegadores bloquearán la cámara.
