# DSWB_2A_2C26_Desarrollo-de-Sistemas-Web-Back-End-

Repositorio del curso de BE del ISFT29 2A 2C 2026.

---

## 📅 Actividad: Persistencia de datos con JSON + CRUD (27/08/2026)

### Temas trabajados en esta clase

- **Persistencia de datos en Node.js**
- **Lectura de archivos JSON con `fs`**
- **Escritura de archivos JSON desde controllers**
- **Integración de persistencia dentro del patrón MVC**
- **Simulación de base de datos usando `personas.json`**

### 🎯 Objetivo

Que el sistema **conserve la información incluso después de reiniciar el servidor**, implementando un CRUD completo cuyo estado se vuelque en un archivo JSON.

### 💻 Actividad práctica (CRUD)

- ✅ Los datos se leen desde un archivo JSON.
- ✅ Los registros nuevos se guardan en el archivo.
- ✅ Las modificaciones impactan en la persistencia.
- ✅ Las eliminaciones actualizan la estructura almacenada.

---

## 🚀 Cómo ejecutar

Ejecución única del proyecto (un solo punto de arranque):

```bash
npm install        # solo la primera vez
npm start          # node index.js
npm run dev        # nodemon index.js (auto-reinicio en desarrollo)
```

Servidor disponible en `http://localhost:3000`.

---

## 📦 Estructura del proyecto (patrón MVC con capa de persistencia (para darle un poco de "orden" al asunto))

```
index.js                            ← único punto de arranque (entry point)
src/
  routes/personas.routes.js         ← rutas /api/personas (CRUD)
  controllers/personas.controller.js ← respuestas HTTP + validación mínima
  repositories/personas.repo.js      ← acceso a datos (fs) → se reemplaza por MongoDB en clases futuras
  utils/persistencia.js              ← helper genérico de lect/escrit JSON (fs/promises)
  data/personas.json                 ← "base de datos" simulada (persistencia en disco)
```

> Diseñada de forma **incremental**: la clase anterior (ruta raíz `GET /` → "Hola Lean!") se conserva intacta, y cada clase nueva solo agrega un módulo. El `controller` no accede al archivo directamente sino a través de la capa de repositorio, por lo que la futura migración a **MongoDB** no requerirá cambios en rutas ni controllers.

---

## 🔌 Endpoints (API REST)

| Método   | Ruta                | Descripción                       | Códigos       |
| -------- | ------------------- | --------------------------------- | ------------- |
| `GET`    | `/`                 | Saludo raíz (conservación previa) | `200`         |
| `GET`    | `/api/personas`     | Lista todas las personas          | `200`         |
| `GET`    | `/api/personas/:id` | Obtiene una persona por id        | `200` / `404` |
| `POST`   | `/api/personas`     | Crea y persiste una persona       | `201` / `400` |
| `PUT`    | `/api/personas/:id` | Modifica y persiste los cambios   | `200` / `404` |
| `DELETE` | `/api/personas/:id` | Elimina de la estructura          | `204` / `404` |

### Ejemplos de uso

**Crear una persona**

```bash
curl -X POST http://localhost:3000/api/personas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"María","apellido":"González","edad":28,"email":"maria@test.com"}'
```

**Modificar una persona**

```bash
curl -X PUT http://localhost:3000/api/personas/1 \
  -H "Content-Type: application/json" \
  -d '{"edad":31}'
```

**Eliminar una persona**

```bash
curl -X DELETE http://localhost:3000/api/personas/1
```

---

## 🧪 Verificación de la persistencia

Flujo validado en clase: se arrancó el servidor, se creó/actualizó/eliminó una persona y luego **se reinició el servidor**, comprobando que los datos persistían en `src/data/personas.json`. Las mutaciones escriben el archivo en disco, por lo que la información **no se pierde al reiniciar**.
