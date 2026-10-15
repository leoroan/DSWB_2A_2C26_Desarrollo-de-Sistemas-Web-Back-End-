# Módulo de pedidos

## Iniciar

```sh
npm start
```

También se puede ejecutar `node index.js`. Abrir `http://localhost:3000/pedidos`.
Las altas y modificaciones de pedidos, productos e ítems se realizan por API.
La asignación de ruta también tiene un formulario en el detalle web.

## Datos y decisiones

- Los clientes son las personas existentes en `src/data/personas.json`; `clienteId` debe existir allí.
- `src/data/pedidos.json` contiene pedidos, ítems, productos, rutas y asignaciones. Incluye dos productos y dos rutas de ejemplo; los pedidos empiezan vacíos.
- Las asignaciones se almacenan aparte para respetar los atributos solicitados de Pedido.
- Las rutas son un catálogo de ejemplo editable en el JSON; este módulo no incluye gestión de recorridos.
- Los identificadores se generan en el servidor y no se modifican desde el cuerpo de una petición.
- Las escrituras se serializan y reemplazan el archivo mediante un temporal. Ejecutar una sola instancia del servidor para esta base JSON.
- El borrado de un pedido elimina sus ítems y asignación. No se permite borrar productos utilizados (409); se pueden desactivar.
- El CRUD de personas existente se mantiene. Si se borra una persona asociada, las vistas muestran que el cliente ya no está disponible.

## Endpoints

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/pedidos` | Listar pedidos con cliente (filtros `?clienteId=&estado=`) |
| POST | `/api/pedidos` | Crear pedido en pendiente con `items` (mínimo 1) |
| GET | `/api/pedidos/:id` | Detalle con cliente, productos, cantidades y ruta |
| PUT | `/api/pedidos/:id` | Actualizar los campos enviados |
| DELETE | `/api/pedidos/:id` | Eliminar pedido, ítems y asignación |
| GET | `/api/pedidos/:id/items` | Listar ítems del pedido |
| POST | `/api/pedidos/:id/items` | Agregar producto y cantidad |
| PUT | `/api/pedidos/:id/items/:itemId` | Actualizar ítem del pedido |
| DELETE | `/api/pedidos/:id/items/:itemId` | Eliminar ítem del pedido |
| PATCH | `/api/pedidos/:id/ruta` | Asignar ruta o quitarla con `rutaId: null` |
| GET | `/api/productos` | Listar productos |
| POST | `/api/productos` | Crear producto |
| GET | `/api/productos/:id` | Consultar producto |
| PUT | `/api/productos/:id` | Actualizar los campos enviados |
| DELETE | `/api/productos/:id` | Eliminar producto sin ítems asociados |
| GET | `/api/rutas` | Consultar rutas disponibles |
| GET | `/pedidos` | Vista de listado |
| GET | `/pedidos/:id` | Vista de detalle |
| POST | `/pedidos/:id/ruta` | Guardar asignación desde formulario |

## Web — vistas Pug

| GET | `/productos` | Vista de listado de productos |
| GET | `/productos/nuevo` | Formulario web para nuevo producto |
| POST | `/productos` | Crear producto web |
| GET | `/productos/:id/editar` | Formulario web para editar producto |
| POST | `/productos/:id/editar` | Actualizar producto web |
| GET | `/rutas/nueva` | Formulario web para nueva ruta |
| POST | `/rutas` | Crear ruta web |

Las altas devuelven 201...
Las altas devuelven 201, consultas y actualizaciones 200, y borrados 204.
Errores: 400 para datos inválidos, 404 para recursos inexistentes y 409 para conflictos.
Las actualizaciones PUT conservan los campos omitidos, siguiendo el uso del proyecto.

### Crear pedido

`POST /api/pedidos`, con `Content-Type: application/json` (D2 + D3: siempre `pendiente`, mínimo 1 producto):

```json
{
  "clienteId": "1787145000000",
  "fechaPedido": "2026-09-16",
  "fechaEntregaSolicitada": "2026-09-18",
  "observaciones": "Entregar en recepción",
  "items": [{ "productoId": 1, "cantidad": 5, "observaciones": "Sin sal" }]
}
```

`fechaPedido` es opcional y toma la fecha UTC actual.
`estado` no se envía (siempre `pendiente`). Fechas: YYYY-MM-DD, entrega igual o posterior al pedido.
Estados: `pendiente`, `confirmado`, `en_preparacion`, `en_reparto`, `entregado`, `cancelado`.
Transiciones: solo hacia adelante, sin retrocesos; se puede cancelar hasta `en_preparacion` (una vez enviado ya no); `entregado` y `cancelado` son terminales.

### Agregar ítem

`POST /api/pedidos/1/items`:

```json
{ "productoId": 1, "cantidad": 5, "observaciones": "Sin sal" }
```

Cantidad entera positiva y producto activo. `pedidoId` se toma de la URL.

### Crear producto

`POST /api/productos`:

```json
{ "nombre": "Vianda vegetariana", "categoria": "Viandas", "precio": 4800, "estado": "activo" }
```

Precio numérico no negativo. Estados: `activo` e `inactivo`.

### Asignar ruta

`PATCH /api/pedidos/1/ruta`:

```json
{ "rutaId": 1 }
```

## Prueba y captura en Postman (guía manual)

1. Iniciar el servidor con datos mock (`npm run seed:reset` si hace falta).
2. Seguir `docs/POSTMAN-GUIA.md` (CU1 a CU17) en Postman con `baseUrl = http://localhost:3000`.
3. Casos que deben pasar: CU1, CU6, CU8, CU13, CU15, CU16.
4. Casos que deben fallar con 400/409: CU2, CU3, CU4, CU5, CU7, CU9, CU10, CU11, CU12, CU14, CU17.
5. Capturar la pantalla del detalle (`GET /api/pedidos/:id`) mostrando método, URL, estado **200 OK** y el JSON con cliente, ítems y ruta. Guardar la imagen para entregar con el proyecto.
6. Antes de borrar los datos de prueba, visitar `/pedidos` y el enlace Ver detalle (con filtros `?clienteId=&estado=`).
7. El borrado (`DELETE /api/pedidos/:id`) elimina pedido, ítems y asignación.

## Pruebas automáticas realizadas

Ejecutar `node --test` (o `npm test` con npm funcionando).
La prueba utiliza una copia temporal del JSON y no modifica los datos del proyecto.

Resultado de la ejecución del 12/09/2026: **1 prueba de integración aprobada, 0 fallos**.
Se verificaron peticiones HTTP reales para altas, actualización de estado y cantidad,
validación de fechas y referencias, cantidades inválidas, aislamiento de ítems por pedido,
bloqueo del borrado de productos usados, asignación por API y formulario,
persistencia, cinco altas concurrentes sin colisión de identificadores,
borrado en cascada, errores 400/404/409 y renderizado Pug con escape de HTML.

En este equipo `npm test` falló porque el ejecutable npm referencia un `npm-cli.js`
inexistente. `node --test` funcionó usando las dependencias ya instaladas.
Este resultado automatizado no sustituye la captura requerida en Postman o Thunder Client.
