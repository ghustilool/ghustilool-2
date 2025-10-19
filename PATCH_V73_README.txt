
GhustiLoOL — Patch v73
======================

Objetivo
- Cards de publicaciones como el boceto: imagen grande arriba, título centrado, etiqueta+versión centradas, botones como siempre.
- Buscador con espacio inferior leve.

Detalles técnicos
- Fuerzo `.pub-item` a **layout en columna** (block) para romper el grid 3 columnas.
- `.pub-cover` ocupa 100% con `object-fit: cover`, max-height 260px.
- `.pub-title`, `.pub-sub` y `.right-chip` **centrados**.
- `.btns` como columna con gap (sin cambiar estilos de botón).

Implementación
- Parche **apéndido** al final de `styles/steam-v71.css`.
- `index.html` actualizado a `steam-v71.css?v=73` para cache-bust.

Archivos tocados
- styles/steam-v71.css
- index.html

Subí el zip tal cual y luego Ctrl+F5 si hace falta.
