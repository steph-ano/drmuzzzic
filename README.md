# 🎵 DRMUZZZIC — Interactive Digital Music Magazine

[![Laravel](https://img.shields.io/badge/Laravel-11+-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-React-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TheAudioDB API](https://img.shields.io/badge/API-TheAudioDB-00D26A?style=for-the-badge)](https://www.theaudiodb.com)

**DRMUZZZIC** es una aplicación web interactiva con estética de revista musical digital de alta fidelidad (estilo Netflix / Spotify Desktop) para explorar la historia, discografía, imágenes de archivo y canciones de bandas y solistas legendarios.

---

## 📸 Capturas & Preview
> *(Se agregarán capturas en alta definición y GIF demostrativo de navegación y carrusel)*

---

## 🎯 Propósito del Proyecto & Valor para el CV
Este proyecto fue diseñado con estándares de ingeniería de software para demostrar:
1. **Consumo de API Externa con Arquitectura de Proxy Backend**: No se expone la API pública al cliente; Laravel actúa como gateway, protegiendo llaves, normalizando datos y absorbiendo la cuota de peticiones mediante caché.
2. **Resiliencia ante Rate Limits**: Mecanismos de `Cache::remember()`, timeouts y reintentos para mitigar el límite de la cuota pública (30 req/min).
3. **Monolito Híbrido Moderno (Inertia.js + React)**: La productividad y seguridad de Laravel combinada con la fluidez SPA de React sin sobrecargar la API REST.
4. **Diseño Visual de Grado Profesional**: Experiencia inmersiva con fanarts a pantalla completa, logotipos PNG transparentes superpuestos, carrusel de discografía con `scroll-snap` nativo y animaciones sutiles.

---

## 🧱 Arquitectura del Sistema

```
[Cliente / Navegador]
       │
       ▼ (Inertia SPA / JSON Fetch)
[Laravel HTTP Controller]
       │
       ├──► [Cache Layer (Redis / File)] ──► [Respuesta Inmediata en Cache Hit]
       │
       ▼ (Si expiró o no existe en cache)
[AudioDbClient Service]
       │
       ▼ (HTTP con reintentos y timeouts)
[TheAudioDB Public API]
```

### Principales Endpoints Internos
| Método | Ruta | Descripción | Estrategia |
|---|---|---|---|
| `GET` | `/` | Home interactivo con artistas destacados y buscador | Inertia Page |
| `GET` | `/api/artists/search?q={query}` | Autocompletado de búsqueda con miniaturas | JSON API + Debounce |
| `GET` | `/artists/{id}` | Vista cinematográfica del artista (fanart + bio + discografía) | Inertia Page + Cache |
| `GET` | `/api/albums/{id}/tracks` | Lista de canciones del álbum seleccionado | JSON API + Cache |

---

## 🚀 Roadmap de Desarrollo

- [x] **Fase 0:** Especificación técnica, arquitectura y repositorio Git.
- [ ] **Fase 1:** Setup del entorno (PHP 8.2+, Composer, Laravel 11, Inertia React, Tailwind).
- [ ] **Fase 2:** Implementación del cliente `AudioDbClient` con `Http::fake` tests y caché.
- [ ] **Fase 3:** UI de Búsqueda inteligente con debounce y sugerencias rápidas.
- [ ] **Fase 4:** Vista cinematográfica de artista (`ArtistHero` con fanart HD, logo PNG y bio colapsable).
- [ ] **Fase 5:** Carrusel de discografía cronológico con visualizador de tracklists.
- [ ] **Fase 6:** Manejo de estados vacíos, skeletons de carga y fallback de imágenes rotas.
- [ ] **Fase 7:** Testing automatizado de backend y frontend.
- [ ] **Fase 8:** Despliegue en producción (Render / Fly.io / Railway) y video demo.

---

## 🛠️ Instalación Local

```bash
# Clonar repositorio
git clone <url-del-repo>
cd drmuzzzic

# Instalar dependencias backend
composer install
cp .env.example .env
php artisan key:generate

# Configurar TheAudioDB API Key en .env
AUDIODB_KEY=123

# Instalar dependencias frontend
npm install
npm run build # o npm run dev

# Iniciar servidor
php artisan serve
```

---

## 📄 Licencia
Distribuido bajo la licencia MIT.
