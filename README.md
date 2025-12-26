# 🚗 Backend Prueba Técnica TurboShop - Express + Sequelize + PostgreSQL

Este proyecto es una aplicación que unifica los datos de los diferentes proveedores de repuestos de vehículos. Consulta continuamente las APIs de los proveedores para mantener un catálogo al día, almacena los datos de los repuestos en una base de datos con un esquema adaptado, permite un acceso a los datos normalizados mediante 2 endpoints, y al mismo tiempo comunica en tiempo real a clientes cambios de precio y/o stock de las ofertas de los productos mediante Server-Sent Events(SSE).

## ⚙️ Requisitos previos
- Node.js
- Yarn
- PostgreSQL

## 🛠️ Instalación local del proyecto 

1. **Clonar el repositorio**

```bash
git clone https://github.com/juanmoyalagos/TurboShop-Prueba-Tecnica-Backend.git
cd TurboShop-Prueba-Tecnica-Backend
```

2. **Crear variables de entorno en archivo .env en la raíz del proyecto**

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

5. **Probar conexión**

Para probar que la configuración se hizo correctamente:

```bash
yarn dev
```

Se debería ver:

```bash
Servidor corriendo en el puerto: 3000
```
## 🧭 Estructura del proyecto y decisiones

El enunciado de la prueba técnica exige la unificación en un solo formato de los diferentes datos de repuestos de las APIs de los diferentes proveedores. Al mismo tiempo, se tiene que implementar una estructura que permita ver en tiempo real las ofertas de los repuestos, garantizando disponibilidad, consistencia, baja latencia y mecanismos de control de errores.

Dado lo anterior, se tomaron las siguientes decisiones:

- Dado que la url de la cual se accede a los diferentes proveedores es una simple API sin mecanismos de comunicación en tiempo real, para simular el "tiempo real" se usa un poller que hace fetching cada cierto tiempo de todas las APIs de los proveedores paralelamente para tener la información de los repuestos al día.
- El frontend no tiene que mandarle información al backend, por lo tanto se implementaron Server-Sent Events para actualizar el frontend en caso de que se detecten cambios en el precio/stock de un producto existente, o si se detecta una oferta nueva para un producto.
- En esta implementación, para no consumir recursos  en Railway, solo se activa el poller cuando se detecta un usuario en las vistas de repuestos general o el detalle de un repuesto. Esto es un trade-off en este caso, porque se podría enviar información de un repuesto específico cuando no hay nadie en la página. Sin embargo, esto se puede aliviar haciendo un fetching constante cada cierto tiempo de las APIs de los proveedores.

## 🧱 Modelos

La aplicación cuenta con una base de datos relacional con 5 modelos en los cuales se almacena la información de los diferentes proveedores:

- Product: se refiere a un producto/repuesto en específico, se identifica con el SKU.
- Offer: hace referencia a la oferta de stock y precio por proveedor.
- Provider: distintos proveedores que tiene la aplicación, se insertan los 3 actuales con seeders para hacer relaciones con las offers.
- Image: noté que la información de los repuestos incluye una lista de URLs de imágenes para cada uno. Creé este modelo para almacenarlas, y no tenerlas como una lista en el modelo product.
- VehicleFit: cada repuesto tiene vehículos compatibles, este modelo los almacena y los relaciona con productos.

!! En caso de que se caigan los proveedores, aún se podrá acceder a esta información persistente de la última actualización.
## 🔌 Adapters

Cada proveedor tiene su propio adaptador que normaliza la información proveniente de sus APIs, estos se encuentran en (`src/adapters`). La estructura junto al poller permite extensibilidad en caso de que hayan más proveedores(asumiendo que siguen una estructura similar las APIs).

## ⏱️ Poller
El poller (`src/poller.ts`) corre cada 5 segundos y orquesta en paralelo los adaptadores de todos los proveedores:
- `getAutoPartsPlusCatalog`
- `getRepuestosMaxCatalog`
- `getGlobalPartsCatalog`

Cada adaptador recibe la data de su proveedor, y la normaliza creando y/o actualizando si es necesario las filas de las diferentes tablas de las BDD. Como se mencionó anteriormente, este poller es disparado automáticamente al haber al menos un cliente SSE conectado y se detiene cuando no quedan suscriptores.

El fetching de datos (`src/lib/apiFetch.ts`) cuenta con mecanismos de retry en caso de que haya error con algún proveedor.

## 🔔 Server-Sent Events (SSE)

- Endpoint: `GET /sse/events` devuelve un stream `text/event-stream`.
- Funcionamiento: al primer cliente conectado se inicia el poller; cuando no quedan suscriptores se detiene para ahorrar recursos.
- Disparadores: cada vez que el poller detecta cambios en precio/stock o nuevas ofertas, se emite un evento `data: {...}` que el frontend consume para actualizarse sin recargar la página.
- Keep-alive: se envían líneas `: keep-alive` cada 15s para mantener abierta la conexión.

## 🌐 Endpoints principales
- `GET /` – Health simple.
- `GET /offers` – Lista productos/ofertas con filtros opcionales: `q`, `brand`, `make`, `model`, `year`, `page`, `limit`. Los query params de page y limit permiten que el frontend reciba menos datos por request para mejorar la latencia en la página web, el resto permite que se realicen filtros. 
- `GET /offers/:sku` – Detalle de producto + ofertas por SKU.
- `GET /sse/events` – Server-Sent Events. Al primer suscriptor se inicia el poller de proveedores; al quedarse sin suscriptores se detiene.

## ⚠️ Dificultades / pendientes
- Las URL de las imágenes no se pudieron mostrar en las vistas de detalle por repuesto (están como placeholder), pero la funcionalidad está implementada en caso de que sean válidas.
- Hay algunos campos de información de las APIs que no se incluyen en los modelos de la base de datos. Se priorizó mostrar lo más relevante por cada modelo. Es modificable.
