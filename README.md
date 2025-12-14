# UC3M Aula Global Scraper

Este script permite extraer un listado de alumnos (Nombre, NIA y Correo) desde la lista de participantes de una asignatura en Aula Global (Moodle).

## Cómo usarlo

1. Entra en Aula Global y ve a la pestaña "Participantes" de tu asignatura.
2. Baja hasta abajo y haz click en "Mostrar XXX", XXX es el número de alumnos.
3. Abre la consola del navegador (F12 -> Console).
4. Copia el código de `app.js` y pégalo en la consola.
5. Presiona Enter y espera a que se descargue el CSV.

## Notas
- El script intenta desencriptar los correos ocultos por Moodle.
- Si aparece "No encontrado", es porque el alumno tiene la privacidad del correo activada o es un profesor, y no detecta un NIA en su correo.
