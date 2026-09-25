# DRMUZZZIC — Implementation Plan & CV Roadmap

**Meta:** Plan de ejecución paso a paso para construir la revista musical interactiva DRMUZZZIC de cero a despliegue con buenas prácticas de ingeniería, historial de commits limpio y enfoque de portafolio para CV.

---

## 📌 1. Estrategia de Git & Commits para el CV

Un reclutador revisa no solo el código final sino el **historial de commits**:
- Evitar commits del tipo *"changes"*, *"fix"*, *"update"*.
- Usar **Conventional Commits**:
  - `chore: initial repository structure and gitignore`
  - `feat(backend): implement AudioDbClient service with retry and caching`
  - `test(backend): add AudioDbClientTest with Http::fake mocks`
  - `feat(api): add artist search and album track endpoints`
  - `feat(frontend): setup Inertia React and cinematic design tokens in Tailwind`
  - `feat(ui): add SearchBar with debounce and dropdown preview`
  - `feat(ui): build ArtistHero with transparent logo and fullscreen fanart backdrop`
  - `feat(ui): implement horizontal scroll-snap album carousel and tracklist drawer`
  - `docs: update README with architecture diagrams, screenshots, and demo guide`

---

## 📌 2. Sprints de Desarrollo

### Sprint 1: Entorno y Scaffold (Día 1)
1. Instalar PHP 8.2/8.3 y Composer en Windows (vía winget o Laragon/standalone).
2. Crear proyecto base Laravel 11:
   ```bash
   composer create-project laravel/laravel .
   composer require inertiajs/inertia-laravel
   php artisan inertia:middleware
   npm install @inertiajs/react react react-dom lucide-react clsx tailwind-merge
   npm install -D @vitejs/plugin-react tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
3. Configurar alias en `vite.config.js`:
   `@` -> `/resources/js`
4. Configurar middleware de Inertia en `bootstrap/app.php` y crear `resources/views/app.blade.php`.

### Sprint 2: Capa Backend & Integración con TheAudioDB (Día 1-2)
1. **Configuración del entorno**:
   Añadir en `.env`:
   ```env
   AUDIODB_BASE_URL="https://www.theaudiodb.com/api/v1/json"
   AUDIODB_KEY="123"
   AUDIODB_CACHE_TTL=86400
   ```
2. **Servicio `AudioDbClient` (`app/Services/AudioDbClient.php`)**:
   - Métodos:
     - `searchArtist(string $query): Collection`
     - `getArtistDetails(string $idOrName): ?array`
     - `getArtistAlbums(string $artistId): Collection`
     - `getAlbumTracks(string $albumId): Collection`
   - Cache con `Cache::remember("audiodb:artist:{$id}", $ttl, ...)`
   - Manejo de fallos con `Http::timeout(5)->retry(2, 200)`
3. **Controladores**:
   - `ArtistController`: Maneja la vista Inertia de detalle y la API JSON de búsqueda.
   - `AlbumController`: Maneja la API JSON de canciones del álbum.
4. **Tests Backend**:
   - `tests/Feature/AudioDbClientTest.php` usando `Http::fake()` para validar parsing, caché y manejo de error 429/500 sin tocar la API real.

### Sprint 3: UI & Experiencia Cinematográfica (Día 2-3)
1. **Paleta de Colores & Tokens**:
   - Fondo: Obsidian `#0A0A0C`, Surface `#121217`, Card `#1A1A22`
   - Acentos: Ambar/Oro Neón `#F59E0B` o Esmeralda Eléctrico `#10B981`
   - Tipografía: Sans moderna (Inter / Outfit / Syne)
2. **Componentes Clave**:
   - `SearchBar.jsx`: Input estilizado con icono de lupa, hook `useDebounce`, dropdown con mini-avatares y skeleton loader.
   - `ArtistHero.jsx`:
     - Imagen de fondo fanart en alta resolución con gradiente `bg-gradient-to-t from-[#0A0A0C] via-black/60 to-transparent`.
     - Logotipo PNG transparente centrado o en la esquina superior con sombras dinámicas.
     - Píldoras de género, estilo, país y año de debut.
     - Biografía en dos columnas o colapsable con botón "Leer más".
   - `AlbumCarousel.jsx`:
     - Contenedor con `flex overflow-x-auto snap-x snap-mandatory scrollbar-none`.
     - Portadas de álbum en aspect-ratio 1:1 con efecto hover zoom sutil.
     - Indicador de año y formato (Álbum, Single, EP).
   - `TrackListModal.jsx` / `TrackListDrawer.jsx`:
     - Muestra las canciones al hacer clic en un álbum.
     - Duración convertida a `MM:SS`, número de pista y link de video de preview si TheAudioDB lo provee (`strMusicVid`).
   - `ImageWithFallback.jsx`:
     - Manejador de `onError` para mostrar un mockup elegante en lugar de una imagen rota.

### Sprint 4: Pulido, Resiliencia y Responsive (Día 3)
1. Estado de carga visual (Skeletons con pulso shimmer para fanarts y álbumes).
2. Mensaje amigable para cuando no se encuentren resultados o el rate limit se alcance.
3. Totalmente adaptado a móvil y desktop (touch scroll en móvil).

### Sprint 5: Documentación de Alto Nivel y Deploy (Día 4)
1. Grabar video demo de 30-45 segundos (Screen Studio, OBS o grabador de pantalla).
2. Actualizar README con capturas y badges.
3. Desplegar en Render / Fly.io / Railway con base de datos SQLite y servidor de assets compilados.
