# Backend Prueba Técnica TurboShop - Express + Sequelize + PostgreSQL

Este proyecto es una aplicación que unifica los datos de los diferentes proveedores de repuestos de vehículos. Consulta continuamente las APIs de los proveedores para mantener un catálogo al día, almacena los datos de los repuestos en una base de datos con un esquema adaptado, permite un acceso a los datos normalizados mediante 2 endpoints, y al mismo tiempo comunica en tiempo real a clientes cambios de precio o stock de las ofertas de los productos mediante Server-Sent Events(SSE).

## Requisitos previos
- Node.js
- Yarn
- PostgreSQL

## Instalación del proyecto

1. **Clonar el repositorio**

```bash
git clone https://github.com/juanmoyalagos/TurboShop-Prueba-Tecnica-Backend.git
cd TurboShop-Prueba-Tecnica-Backend
```

2. **Crear variables de entorno en archivo .env en la raiz de proyecto**

Crea un `.env` en la raíz con lo siguiente:
```
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
PROVIDER_API_BASE_URL=https://web-production-84144.up.railway.app/api/
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=turboshop_db
DB_USERNAME=turboshop_user
DB_PASSWORD=tu_clave_segura
DB_DIALECT=postgres
```

3. **Crear base de datos y usuario**

```
sudo -i -u postgres
createdb turboshop_db
createuser turboshop_user
psql -d turboshop_db
```
En la consola de psql:

```
ALTER USER turboshop_user WITH ENCRYPTED PASSWORD 'tu_clave_segura';
GRANT ALL PRIVILEGES ON DATABASE turboshop_db TO turboshop_user;
GRANT ALL ON SCHEMA public TO turboshop_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO turboshop_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO turboshop_user;
ALTER USER turboshop_user CREATEDB;
\q
exit
```

4. **Instalar dependencias, correr migraciones y seeders**
```bash
yarn install
yarn sequelize-cli db:migrate
yarn sequelize-cli db:seed:all
```

5. Probar conexión

Para probar que la configuración se hizo correctamente:

```bash
yarn dev
```

Se debería ver:

```bash
Servidor corriendo en el puerto: 3000
```


## Endpoints principales
- `GET /` – Health simple.
- `GET /offers` – Lista productos/ofertas con filtros opcionales: `q`, `brand`, `make`, `model`, `year`, `page`, `limit`.
- `GET /offers/:sku` – Detalle de producto + ofertas por SKU.
- `GET /sse/events` – Server-Sent Events. Al primer suscriptor se inicia el poller de proveedores; al quedarse sin suscriptores se detiene.

## Poller
El poller (`src/poller.ts`) corre cada 5 segundos y ejecuta en paralelo:
- `getAutoPartsPlusCatalog`
- `getRepuestosMaxCatalog`
- `getGlobalPartsCatalog`

Es disparado automáticamente al haber al menos un cliente SSE conectado y se detiene cuando no quedan suscriptores.

## CORS
Configurable vía `FRONTEND_ORIGIN` (por defecto `http://localhost:5173`).

## Ejecución local rápida
```bash
cp .env.example .env   # si tienes un ejemplo; de lo contrario crea el .env
yarn install
yarn sequelize-cli db:migrate
yarn sequelize-cli db:seed:all
yarn dev

