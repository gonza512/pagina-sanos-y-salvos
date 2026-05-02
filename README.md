# Sanos y Salvos - Frontend

Plataforma inteligente para la localizacion y recuperacion de mascotas perdidas.

Este frontend en React + TypeScript corresponde a la base funcional del caso semestral y se alinea con los tres modulos principales:
- Gestion de mascotas perdidas/encontradas.
- Geolocalizacion por zonas de incidencia.
- Motor de coincidencias entre reportes.

## Stack
- React 18
- TypeScript
- Vite
- Vitest + Testing Library

## Ejecucion local

1. Instalar dependencias:

```bash
npm install
```

2. Levantar entorno de desarrollo:

```bash
npm run dev
```

### Backend disponible

El backend activo del repositorio está en [spring-backend](spring-backend). Incluye el API Gateway y el servicio de usuarios/autenticación.

Para validar ese backend:

```bash
cd spring-backend
mvn test
```

Si necesitas el esquema SQL heredado, sigue disponible en [sql/xampp_schema.sql](sql/xampp_schema.sql).

### Conectar microservicios separados

Este frontend ya está preparado para hablar con un API Gateway o con microservicios directos mediante variables de entorno.

En desarrollo local, crea o ajusta [`.env.local`](.env.local) con tus URLs reales:

```bash
VITE_API_GATEWAY_URL=http://localhost:8080
VITE_API_USUARIOS_URL=http://localhost:8081
VITE_API_MASCOTAS_URL=http://localhost:8094
VITE_API_REPORTES_URL=http://localhost:8095
VITE_API_GEOLOCALIZACION_URL=http://localhost:8091
VITE_API_COINCIDENCIAS_URL=http://localhost:8092
VITE_API_CONSULTAS_URL=http://localhost:8097
VITE_API_RESENAS_URL=http://localhost:8098
```

Regla práctica:
- Si usas gateway, apunta el frontend solo a `VITE_API_GATEWAY_URL`.
- Si quieres evitar gateway, define cada `VITE_API_*_URL` y el frontend construirá las rutas por servicio.
- Si corres todo con Docker, dentro del contenedor del gateway usa nombres de servicio de Docker, no `localhost`.

### Ejecutar arquitectura con Docker

```bash
docker compose up --build
```

Este despliegue levanta el API Gateway, el servicio de usuarios/autenticación y el frontend.

Si quieres arrancar solo el backend, usa:

```bash
docker compose up users-auth-service api-gateway
```

3. Ejecutar pruebas unitarias:

```bash
npm run test
```

## Mapeo funcional con el Caso Semestral

### Parcial 1 - Arquitectura y Patrones
Se incluye la propuesta arquitectonica en:
- docs/arquitectura-microservicios.md

Elementos cubiertos:
- Definicion de la arquitectura lógica del caso.
- API Gateway y BFF.
- Patrones: Repository, Factory Method y Circuit Breaker.
- Justificacion tecnica y diagrama de arquitectura.

### Parcial 2 - Desarrollo Frontend/Backend
Estado actual del frontend:
- Modulo de reportes en src/pages/Mascotas.tsx.
- Modulo de geolocalizacion (vista de incidencia) en src/pages/Consultas.tsx.
- Modulo de coincidencias en src/pages/Resenas.tsx.

Backend disponible actualmente:
- API Gateway en [spring-backend](spring-backend).
- Servicio de usuarios/autenticacion en [spring-backend](spring-backend).

La propuesta completa del caso sigue documentada en [docs/arquitectura-microservicios.md](docs/arquitectura-microservicios.md).

### Parcial 3 - Integracion y Pruebas
Base de pruebas existente en:
- src/__tests__/

Meta recomendada:
- Cobertura >= 60% validada por SonarQube.
- Pipeline CI para ejecutar tests automaticos en cada push/PR.

## Estructura relevante
- src/pages/Mascotas.tsx: registro de reportes perdidos/encontrados.
- src/pages/Consultas.tsx: tablero de zonas con mayor incidencia.
- src/pages/Resenas.tsx: deteccion de coincidencias por score.
- src/services/reportesService.ts: persistencia local y logica de matching.
- src/types/reportes.ts: tipos del dominio de reportes.

## Nota
La implementacion actual integra un backend Spring Boot reducido junto con el frontend React. La persistencia del servicio de usuarios usa la configuracion local de Spring para simplificar el desarrollo y la demo.
