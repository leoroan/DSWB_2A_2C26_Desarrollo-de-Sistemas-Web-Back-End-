# Módulo de Clientes

El módulo de Clientes permite administrar los clientes de FreshRoute B2B.

Un cliente representa un establecimiento al que FreshRoute B2B realiza entregas.

Los tipos de cliente permitidos son:

- Restaurante
- Comedor

Los clientes pueden encontrarse en los siguientes estados:

- Activo
- Inactivo

## API REST

La API de clientes está disponible bajo:

`/api/clientes`

### Obtener todos los clientes

**GET** `/api/clientes`

Devuelve el listado de clientes registrados.

### Obtener un cliente por ID

**GET** `/api/clientes/:id`

**Parámetro:**

- `id`: identificador del cliente.

Si el cliente existe, devuelve sus datos.

Si no existe, responde con:

`404 Not Found`

```json
{
  "error": "Cliente no encontrado"
}
```

### Crear un cliente

**POST** `/api/clientes`

El cuerpo de la petición debe contener:

```json
{
  "nombre": "Restaurante El Buen Sabor",
  "tipo": "Restaurante",
  "email": "contacto@elbuensabor.com",
  "telefono": "1123456789",
  "domicilioDeEntrega": "Av. Siempre Viva 123"
}
```

El sistema valida que:

- el nombre sea obligatorio.
- el tipo sea obligatorio y corresponda a un tipo permitido.
- el email sea obligatorio.
- el teléfono sea obligatorio.
- el domicilio de entrega sea obligatorio.

El estado inicial se establece como `Activo` y la fecha de alta se genera automáticamente.

Si la creación es correcta, responde con:

`201 Created`

### Actualizar un cliente

**PUT** `/api/clientes/:id`

**Parámetro:**

- `id`: identificador del cliente.

Permite actualizar los datos enviados del cliente.

Los campos admitidos incluyen:

- `nombre`
- `tipo`
- `email`
- `telefono`
- `domicilioDeEntrega`
- `estado`

Los valores permitidos para `tipo` son:

- `Restaurante`
- `Comedor`

Los valores permitidos para `estado` son:

- `Activo`
- `Inactivo`

Si el cliente no existe, responde:

`404 Not Found`

```json
{
  "error": "Cliente no encontrado"
}
```

Si la actualización es correcta, responde con los datos actualizados.

### Eliminar un cliente

**DELETE** `/api/clientes/:id`

**Parámetro:**

- `id`: identificador del cliente.

Si el cliente existe, se elimina del archivo de persistencia.

La respuesta exitosa es:

`204 No Content`

Si el cliente no existe, responde:

`404 Not Found`

```json
{
  "error": "Cliente no encontrado"
}
```

## Persistencia

Los datos de los clientes se almacenan en:

`src/data/clientes.json`

El acceso a los datos se realiza mediante el repositorio de clientes y las funciones de persistencia de archivos JSON.

## Arquitectura

El módulo está organizado en capas:

- **Modelo:** `src/models/Cliente.js`
- **Repositorio:** `src/repositories/clientes.repo.js`
- **Servicio:** `src/services/clientes.service.js`
- **Controlador API:** `src/controllers/clientes.controller.js`
- **Rutas API:** `src/routes/clientes.routes.js`
- **Controlador Web:** *unificado con Controlador API* (`src/controllers/clientes.controller.js`)
- **Rutas Web:** `src/routes/clientes.web.routes.js`
- **Vistas:** `src/views/clientes/`

La separación de responsabilidades permite mantener independiente la lógica de negocio, el acceso a datos, el manejo de peticiones y la interfaz web.
