# Gógoblu — Rediseño del menú · Handoff a sesión local

Este documento traspasa el trabajo hecho en la sesión web (Claude Code on the web)
a una sesión **local** donde se puede ejecutar y probar el sitio. Todo el trabajo
está en la rama `claude/repo-exploration-jdm416`.

## 1. Contexto

Gógoblu es un café de especialidad + juegos de mesa (Colombia). El menú se accede
por **QR desde el celular**. El sitio actual (raíz del repo: `index.html`,
`script.js`, `style.css`) muestra el menú como "planetas orbitando" y carga los
productos en vivo desde un **Google Apps Script** que expone una Google Sheet.

Objetivo del rediseño: menú más vendedor y con mejor UX, con **fotos**,
**detalle de producto**, **producto del mes / novedades**, **fichas de juegos de
mesa** y un **recomendador de juegos**. El pedido se toma **en mesa** y el pago es
**en barra** (no hay carrito ni checkout).

## 2. Decisiones del equipo  ⚠️ CONFIRMAR/COMPLETAR

- **Dirección visual elegida:** _(Cálida / Premium)_ → __________
- Otros ajustes acordados: __________

> La sesión que dejó este handoff no alcanzó a registrar la decisión final.
> Confírmala aquí antes de implementar. Ambas direcciones están prototipadas
> (ver §4).

## 3. Diseño de referencia (prototipos navegables)

Se construyó un canvas de diseño (Claude Design) publicado como Artifact:
- URL: https://claude.ai/code/artifact/071a77f9-a2be-496d-9767-8bf126dda3e3
- Fuente de los prototipos: carpeta `design-mockups/` (archivos `.dc.html`).
  - `PrototipoCalida.dc.html` — **prototipo navegable, dirección Cálida, con el
    menú REAL** (categorías, precios, descripciones, adiciones, agotados ocultos,
    recomendador de juegos, Info real, Sudoku). **Es la mejor referencia funcional.**
  - `PrototipoPremium.dc.html` — prototipo navegable, dirección Premium (datos de
    muestra en café).
  - `MainCalida/DetalleCalida/JuegoDetalleCalida.dc.html` y las `*.dc.html` premium
    — pantallas estáticas de referencia.
  - `gogoblu-menu-redesign.html` — el canvas empaquetado (no editar a mano).

Marca: verde `#315659`, dorado `#D7BC77`, crema `#F6EEE0`. Fuente oficial: **Nunito**.

## 4. Fuente de datos (Google Sheets vía Apps Script)

- El sitio actual hace `fetch(API_URL + '?action=menu')` y recibe `{ ok, data: [...] }`.
- ⚠️ **El `API_URL` en `script.js` del repo está DESACTUALIZADO** (devuelve error).
  El endpoint vivo es el del sitio en producción: sacar el `API_URL` real de
  `https://kev1n44.github.io/Men-/script.js` (o de la consola de Apps Script:
  Implementar → Gestionar implementaciones → URL de la app web).
- **Columnas actuales** de la hoja: `PRODUCTO, CATEGORIA, PRECIO, DISPONIBLES,
  ESTADO MENU` (+ una 6ª columna basura "Agotado" que hay que borrar).
- **Columnas a AGREGAR** (acordadas):
  - `DESCRIPCION` — texto sensorial por producto. **Ya generado** en
    `design-mockups/descripciones-menu.csv` (109 productos) para pegar en la hoja.
  - `IMAGEN` — URL de la foto (fotos llegan por lotes; el diseño debe funcionar sin
    ellas con un placeholder "FOTO PRONTO").
  - `ETIQUETA` — `nuevo` | `temporada` | vacío (alimenta Novedades y Producto del mes).
    Sugerencias iniciales incluidas en el CSV.
- **Categorías** (de la data real): Bebidas calientes, Bebidas frías, Productos
  dulces, Productos salados, Licores, y `Adición` (estas alimentan "adiciones").
- **Disponibilidad:** usar `ESTADO MENU` — ocultar `Agotado`, marcar `Bajo stock`.
- Habrá que **ajustar el Apps Script** para que devuelva los campos nuevos
  (`descripcion`, `imagen`, `etiqueta`).

## 5. Alcance a implementar (según el prototipo Cálido)

- Home: header de marca + **Producto del mes** (carrusel si hay varios `etiqueta=temporada`)
  + **Novedades** (`etiqueta=nuevo`) + grilla de categorías + acceso a Juegos + Info.
- Categoría: lista de productos con miniatura (lazy-load), descripción, precio;
  agotados ocultos, "Bajo stock" marcado.
- Detalle de producto: foto grande, descripción, precio, adiciones sugeridas
  (de la categoría `Adición`), nota "Pídelo en tu mesa".
- Juegos de mesa: lista con fichas (jugadores, tiempo), "creados en la casa"
  destacados, y **recomendador "¿Para su mesa?"** (filtra por nº de jugadores y
  tiempo). Los datos de juegos hoy están en `script.js` (constante de juegos) — a
  futuro migrar a su propia hoja con columnas `juego, descripcion, jugadores,
  tiempo, edad, dificultad, categoria, imagen, de_la_casa`.
- Ficha de juego: imagen, jugadores, duración, edad, dificultad, descripción.
- Info: WiFi (GOGOBLU / Since2025), Horario (Lun–Jue 2–8 pm · Vie–Dom 12–10 pm),
  Ubicación (Calle 32 # 30-11), Instagram (@gogo.blu). Cierre del ciclo:
  "Seguir en Instagram" (aún no hay link de reseñas de Google).
- Sudoku: conservado como detalle lúdico.
- Rendimiento móvil: **lazy-load** de imágenes, thumbnails, carga rápida.

## 6. Consideraciones técnicas

- El sitio actual es **HTML/CSS/JS vanilla** servido por **GitHub Pages** (repo
  `kev1n44/Men-`). Lo más simple es mantener ese stack (sin build) para no romper
  el despliegue por QR. Evaluar con el equipo si se quiere un framework.
- A futuro (no ahora): panel de administración con Supabase para editar el menú.
- Refrescar el menú periódicamente (el actual lo hace cada 45 s).

## 7. Cómo continuar en local

```bash
# 1. Clonar y ubicarse en la rama de trabajo
git clone https://github.com/dapanas/Men-.git
cd Men-
git checkout claude/repo-exploration-jdm416

# 2. Abrir Claude Code en la carpeta
claude

# 3. Servir el sitio para probar (elige uno)
python3 -m http.server 8000      # http://localhost:8000
# o
npx serve .
```

En local **sí hay acceso de red** al Apps Script, así que se puede probar la carga
real del menú (a diferencia del entorno web, que lo bloqueaba).

### Prompt sugerido para arrancar la sesión local

> Lee `HANDOFF.md` y `design-mockups/PrototipoCalida.dc.html`. Vamos a implementar
> el rediseño del menú de Gógoblu en HTML/CSS/JS vanilla (dirección elegida:
> [Cálida/Premium]), reemplazando `index.html`, `style.css` y `script.js`,
> conectado al Google Sheet vía Apps Script (usa el endpoint vivo, no el del repo).
> Empecemos por la estructura y la carga de datos, con placeholder de foto y
> lazy-load. Muéstrame el sitio corriendo localmente.

## 8. Estado / pendientes

- [ ] Confirmar dirección visual (§2).
- [ ] Pegar `DESCRIPCION` y `ETIQUETA` en la hoja (desde `descripciones-menu.csv`).
- [ ] Agregar columna `IMAGEN` y subir fotos (llegan por lotes).
- [ ] Recuperar el `API_URL` vivo y ajustar el Apps Script para los campos nuevos.
- [ ] Implementar el sitio real y reemplazar el actual.
- [ ] (Opcional) Crear perfil de Google Business para reseñas y cambiar el CTA de Info.
