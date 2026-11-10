# FreshRoute B2B - Distribución Inteligente (ISFT N° 29 - Backend 2026)

## Módulo de pedidos

Disponible en `/pedidos`, con API REST de pedidos, ítems, productos y asignación a rutas.
Ver [endpoints, ejemplos y pasos de prueba](docs/PEDIDOS.md) e importar la
[colección de Postman](docs/FreshRoute.postman_collection.json).
Pruebas de integración: `node --test`.

Este repositorio contiene la primera entrega para la asignatura de Desarrollo Web Backend del "ISFT n°29", curso 2° A 2C2026. El proyecto implementa una aplicación web utilizando Node.js y Express, siguiendo una estructura organizada de carpetas. La persistencia de datos se realiza en **MongoDB** a través de **Mongoose** (ODM). Se han aplicado conceptos de Programación Orientada a Objetos (POO), rutas dinámicas, middlewares y el motor de plantillas Pug.

---

## 🚀 Requisitos de la Entrega y Objetivos Específicos

El objetivo principal fue desarrollar una aplicación web funcional que demuestre los conceptos vistos en clase, enfocándose en un caso de negocio real y aplicando buenas prácticas de desarrollo.

### Objetivos Específicos Cumplidos:

- Desarrollo de una aplicación web utilizando **Node.js y Express**.
- Integración de una base de datos **MongoDB** con **Mongoose** (ODM), alojada en **MongoDB Atlas**.
- Aplicación de conceptos de **Programación Orientada a Objetos (POO)** en el diseño del modelo de dominio.
- Implementación de **rutas dinámicas** para acceso a recursos detallados.
- Uso de **middlewares** para lógica transversal (logging, validación, manejo de errores).
- Utilización del motor de plantillas **Pug** para la generación de vistas dinámicas.
- El proyecto ha sido diseñado para ser probado con **Postman** (endpoints API REST) y capturar evidencia manual.
- Aplicación de buenas prácticas de desarrollo y una estructura modular.

---

## 📊 Caso de Negocio: Logística – Distribución Inteligente de Comida "FreshRoute B2B"

### Descripción del Negocio

FreshRoute B2B es una empresa de logística especializada en el reparto diario de viandas corporativas e insumos gastronómicos refrigerados para más de 120 restaurantes y comedores de empresas. Cuenta con una dotación de 40 empleados (25 choferes/repartidores, 8 operadores de depósito, 4 planificadores de rutas y 3 administrativos).

### Problemática de Gestión

Existe una desconexión total entre los planificadores de oficina y los choferes en la calle. Los choferes alteran los recorridos por criterio propio al sentirse presionados por los tiempos, mientras que la dirección sanciona económicamente los retrasos sin analizar las causas reales del tráfico o las entregas rechazadas.

### Procesos Financieros

El cobro por servicio es diferido a 30 días según remito firmado. Se aplican penalizaciones económicas severas si la entrega llega fuera de la ventana horaria asignada o si se rompe la cadena de frío.

### Problemas y Necesidades Identificadas

- Hojas de ruta armadas en planillas estáticas sin considerar el tráfico ni la urgencia de la carga.
- Falta de trazabilidad en tiempo real sobre la ubicación de las unidades y la temperatura de los productos, generando reclamos constantes no auditables.

---

## 📝 Análisis y Propuestas Realizadas

### Identificación de Tensiones y Paradigma Organizacional

Las tensiones en el equipo surgen de la falta de comunicación y herramientas adecuadas. Los choferes se sienten presionados y desautorizados, mientras que la dirección aplica sanciones sin entender el contexto operativo real. La organización opera bajo un **Paradigma Organizacional Burocrático y de Control Rígido**, donde la toma de decisiones es centralizada y la ejecución periférica carece de autonomía y visibilidad, generando fricción y desmotivación.

### Diagrama del Proceso "Planificación y Despacho de Rutas" y Puntos de Falla

**Proceso Actual (simplificado):**

1.  Planificador crea hoja de ruta en planilla estática.
2.  Hoja de ruta se entrega impresa al chofer.
3.  Chofer ejecuta ruta según su criterio y presiones.
4.  Entrega/Rechazo del producto (con o sin remito).
5.  Dirección evalúa retrasos y penaliza sin contexto.

**Puntos de Falla Críticos:**

- **Falta de Datos en Tiempo Real:** Las planillas estáticas no consideran tráfico, clima o urgencia. Esto lleva a rutas subóptimas y a la tentación de alterarlas.
- **Desconexión Operacional:** Ausencia total de visibilidad sobre la ubicación del vehículo o el estado de las entregas una vez que el chofer sale del depósito.
- **Quiebre de Cadena de Frío (no detectado):** No hay monitoreo de temperatura, lo que implica riesgo sanitario y penalizaciones post-facto sin acciones preventivas.
- **Falta de Evidencia y Auditoría:** Las entregas rechazadas o los retrasos no tienen un registro detallado de sus causas, generando disputas y sanciones injustas.

### Requerimientos No Funcionales (FURPS+) - Performance y Escalabilidad

**Performance:**

- **Tiempo de Respuesta de Telemetría:** El sistema debe procesar y registrar telemetría de ubicación y temperatura de al menos 25 vehículos cada 30 segundos, con un tiempo de respuesta inferior a 500 ms por evento.
- **Carga del Dashboard:** El dashboard de planificación debe cargar la información consolidada de todas las rutas y sus estados en menos de 2 segundos.

**Escalabilidad:**

- **Crecimiento de Vehículos:** El sistema debe poder escalar para soportar 100 vehículos activos simultáneamente reportando telemetría sin degradación significativa de performance.
- **Crecimiento de Datos:** La base de datos (JSON en esta etapa) debe manejar un historial de telemetría de al menos 1 año para todos los vehículos y rutas, manteniendo tiempos de consulta aceptables.
- **Georreferenciación:** Integración con APIs de mapas que permitan el ruteo optimizado y la visualización en tiempo real para hasta 100 rutas concurrentes.

### Metodología de Desarrollo: DevOps y Scrum (para la App de Choferes)

Para la aplicación móvil de los choferes (que requiere iteraciones rápidas y feedback constante), se propone una metodología híbrida:

- **Scrum (Framework Ágil):** Para la gestión del proyecto y el desarrollo iterativo. Se establecerán Sprints cortos (1-2 semanas), con reuniones diarias (Daily Scrum), Planificación, Revisión y Retrospectiva. Esto permitirá adaptarse rápidamente a los requisitos cambiantes de la operación en campo y obtener feedback temprano de los choferes.
- **DevOps (Cultura y Prácticas):** Para la integración continua (CI), despliegue continuo (CD) y monitoreo. Herramientas como Git para control de versiones, integración con pipelines de CI/CD (ej. Jenkins o GitHub Actions) para automatizar pruebas y despliegues, y monitoreo constante de la aplicación en producción (ej. con Prometheus y Grafana) para detectar problemas de performance o estabilidad en tiempo real. Esto asegura entregas rápidas, confiables y con alta calidad.

---

## 📦 Estructura del Proyecto

```
.
├── node_modules/
├── src/
│   ├── config/
│   │   ├── env.js                 # Variables de entorno (dotenv) y constantes
│   │   └── database.js            # Conexión a MongoDB con Mongoose
│   ├── database/
│   │   ├── seed.js                # Migra los JSON de data/ a MongoDB
│   │   └── crear-usuario.js       # Alta interactiva de usuarios (login)
│   ├── domain/                   # Dominio POO (sin Mongoose, sin Express)
│   │   ├── entities/             #   Clases con propiedades y comportamiento
│   │   │   ├── Persona.js        #   base: Chofer/Empleado/Cliente heredan
│   │   │   ├── Empleado.js       #   base de Chofer
│   │   │   ├── Chofer.js / Cliente.js / Pedido.js / ItemPedido.js
│   │   │   ├── Producto.js / Parada.js / Ruta.js / Vehiculo.js
│   │   │   └── Remito.js / RegistroTelemetria.js
│   │   └── validators/           #   Validación y normalización por entidad
│   │       ├── pedido.validator.js / itemPedido.validator.js
│   │       ├── producto.validator.js / cliente.validator.js
│   ├── controllers/            # Lógica de negocio y manejo de peticiones
│   │
│   ├── data/                   # JSON originales (semilla; no se usan en caliente)
|   |
│   ├── middlewares/            # Funciones intermedias de Express
|   |
│   ├── models/                 # Persistencia BDD: SOLO esquemas Mongoose
│   │   ├── index.js            #   Registro central + siguienteId() + Usuario/Sesion
│   │   └── *.schema.js         #   un esquema por colección (cliente, pedido…)
|   |
│   ├── repositories/           # Traducen Mongo ↔ entidades de dominio
|   |
│   ├── routes/                 # Definición de rutas de la aplicación
|   |
│   └── utils/                  # Utilidades generales
│       └── validaciones.js     # Helpers genéricos (exigir, idValido, texto…)
├── views/                      # Plantillas Pug para el frontend
|
├── .env                        # Configuración local (NO se sube al repo)
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── index.js                    # Archivo principal de la aplicación Express
├── package-lock.json
└── package.json
```

> **Nota de arquitectura:** `src/models/*.schema.js` son los **esquemas Mongoose**
> (persistencia BDD) compilados una sola vez en `src/models/index.js`.
> `src/domain/entities/` conserva las **clases POO** (propiedades + métodos, sin
> validaciones) y `src/domain/validators/` la validación por entidad. Los
> `repositories/` traducen entre documentos de Mongo y esas clases, de modo que
> controladores, servicios y vistas **no cambian**.

---

## 🛠️ Instalación y Ejecución

### Requisitos Previos

- [Node.js](https://nodejs.org/es/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) (viene incluido con Node.js)
- Una base de datos **MongoDB** (local o un clúster gratuito en **MongoDB Atlas**)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/leoroan/DSWB_2A_2C26_Desarrollo-de-Sistemas-Web-Back-End-.git
    cd DSWB_2A_2C26_Desarrollo-de-Sistemas-Web-Back-End-
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar las variables de entorno:**
    Copiá la plantilla y editá el archivo `.env` con los datos de tu base:

    ```bash
    # Windows (PowerShell)
    Copy-Item .env.example .env
    ```

    Luego abrí `.env` y completá `MONGODB_URI` con tu cadena de conexión
    (ver la sección **“Credenciales de MongoDB Atlas”** más abajo).

4.  **Cargar los datos iniciales (seed/migración):**
    Este paso copia los datos de `src/data/*.json` a MongoDB para que la
    aplicación tenga exactamente la misma información que antes:
    ```bash
    npm run seed           # Carga sin borrar lo existente
    npm run seed:reset    # Vacía las colecciones y vuelve a cargar
    ```
5.  **Ejecutar la aplicación:**
    - **Modo desarrollo (con `nodemon` para reinicios automáticos):**
      ```bash
      npm run dev
      ```
    - **Modo producción (ejecución estándar):**
      ```bash
      npm start
      ```

    > El servidor se conecta a MongoDB **antes** de empezar a escuchar peticiones.
    > Si la conexión falla, se muestra el error y el proceso se detiene.

### 🔑 Credenciales de MongoDB Atlas

Para conectar la app a **MongoDB Atlas** necesitás la cadena de conexión. Se
arma con un **usuario**, una **contraseña** y el **host de tu clúster**. Te
indicamos exactamente dónde obtener cada dato dentro de Atlas:

1.  **Crear el clúster** (si aún no tenés uno): en el panel de Atlas, botón
    **“+ Create”** → elegí el plan gratuito **M0** → **Create Deployment**.

2.  **Usuario y contraseña de la base de datos:**
    - En el menú izquierdo andá a **Database Access** (o aparece al crear el
      clúster en el paso de _Security Quickstart_).
    - **Create Database User**: definí un **username** y una **password**
      (guardalos, son los que van en la URI). Elegí el rol **“Read and write to
      any database”**.

3.  **Permitir tu IP (Network Access):**
    - En el menú izquierdo, **Network Access** → **Add IP Address**.
    - Para desarrollo podés usar **“Allow access from anywhere”** (`0.0.0.0/0`).

4.  **Obtener la cadena de conexión (Connection String):**
    - En **Database**, botón **“Connect”** de tu clúster → **Drivers** (o
      **“Connect your application”**).
    - Copiá el string, con este formato:
      ```
      mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
      ```
    - Reemplazá `<username>`, `<password>` y `<cluster-host>` por los tuyos, y
      el nombre de la base (`freshroute`).

5.  **Pegarla en el `.env`:**
    ```env
    MONGODB_URI=mongodb+srv://miusuario:MiPassword123@cluster0.abcd.mongodb.net
    MONGODB_DB=freshroute
    ```
    > ⚠️ Si tu contraseña tiene caracteres especiales (`@ : / ? #`), codificalos
    > en la URL (por ejemplo `@` → `%40`).

### Acceso a la Aplicación

Una vez que el servidor esté corriendo, podrás acceder a las diferentes secciones:

- **URL inicio:** `http://localhost:3000/`
- **URL en RENDER:** `https://dswb-2a-2c26-desarrollo-de-sistemas-web.onrender.com/`
- **Documentación 1er entrega:** `http://localhost:3000/documentacion`
- **Endpoints de la API REST:** `http://localhost:3000/api` (para que podamos probar con Postman)

---

## Autenticación, autorización y contraseñas

La aplicación utiliza **JWT firmados con HS256** mediante `jsonwebtoken` para
las vistas web y la API REST. Cada petición valida firma, algoritmo, emisor,
audiencia y vencimiento. MongoDB conserva el hash del JWT emitido para poder
revocarlo inmediatamente al cerrar sesión. Los tokens opacos de la versión
anterior ya no son válidos: hay que iniciar sesión nuevamente.

### Contraseñas con hash

Las contraseñas se guardan con **scrypt** de `node:crypto`, salt aleatorio de
16 bytes y clave derivada de 64 bytes. Se comparan con `timingSafeEqual`.
No se acepta texto plano al iniciar sesión. El campo `password` se excluye de
las consultas por defecto. El modelo aplica el hash al crear o guardar usuarios
y al ejecutar `insertMany` (incluido el seed). Para cambiar una contraseña,
asignala al documento y ejecutá `save()`; las actualizaciones directas que
modifican contraseñas se rechazan. No uses escrituras directas a la colección
ni `bulkWrite` para administrar credenciales, porque omiten estos hooks.

### Roles y permisos

| Rol | Consultar páginas y API | Crear, modificar y eliminar datos |
| --- | --- | --- |
| `admin` | Sí | Sí |
| `operador` | Sí | No (403) |
| Sin sesión | Redirección a `/login` en web; 401 en API | Sin acceso |

Los usuarios nuevos tienen rol `operador` por defecto. El rol se consulta desde
MongoDB en cada petición; el cliente no puede elegirlo al iniciar sesión.
Los controles se aplican en el servidor, aunque una vista muestre formularios.
Para crear un usuario y elegir su rol, ejecutá:

```bash
npm run user:create
```

El comando solicita nombre, correo, contraseña (8 a 256 caracteres) y rol
(`admin` u `operador`). La contraseña ingresada es visible en la terminal.
El seed incluye un administrador de demostración: `admin@freshroute.com.ar`,
contraseña `admin1234`. Esa clave pública está en el JSON de ejemplo;
usala únicamente para una demostración local. La cuenta solo existe si se
cargó ese seed en la base configurada; no se crea al iniciar la aplicación. En MongoDB se guarda su
hash. Para un despliegue real, quitá esa cuenta y creá un administrador propio.

### Bases existentes con contraseñas en texto plano

Antes de iniciar sesión con usuarios de la versión anterior, ejecutá sobre la
base configurada en `.env`:

```bash
npm run user:migrate-passwords
```

Convierte las contraseñas existentes a hash sin cambiar sus valores, conserva
los hashes ya migrados y revoca todas las sesiones. Puede ejecutarse nuevamente.
Conserva los roles existentes; los usuarios sin rol quedan como `operador`.
Para disponer de un administrador, creá uno con otro correo mediante
`npm run user:create` y elegí `admin`. No es necesario borrar la base ni ejecutar
`seed:reset` para migrar.

### Restablecer la contraseña de una cuenta existente

Si una cuenta existente rechaza la contraseña, podés definir una nueva desde
la terminal del proyecto, usando la base configurada en `.env`:

```bash
npm run user:password
```

Ingresá el correo, la nueva contraseña (8 a 256 caracteres) y su confirmación.
El comando guarda un nuevo hash scrypt y revoca las sesiones de esa cuenta.
Conserva el nombre, correo, rol y demás datos. La contraseña es visible en tu
terminal local: no la compartas en el chat. Es una herramienta administrativa
que requiere acceso a las credenciales de MongoDB; no es un endpoint público.
Si las contraseñas no coinciden o no existe la cuenta, no modifica usuarios.

### Configuración de JWT

Agregá `JWT_SECRET` en `.env` (y en las variables de entorno de Render), con
un secreto aleatorio privado de al menos 32 bytes. Generá uno con:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Copiá el resultado en `JWT_SECRET=...`. No publiques ese valor. El servidor no
inicia si falta el secreto o es demasiado corto. Todos los procesos de la app
deben compartir el mismo secreto. Cambiarlo invalida todos los JWT anteriores.
La plantilla `.env.example` incluye esta variable.

### Login, JWT y logout

| Endpoint público | Resultado |
| --- | --- |
| `GET /login` | Formulario web |
| `POST /login` | Valida `email` y `password`, emite JWT en cookie y redirige a `/` |
| `POST /api/auth/login` | Recibe JSON con `email` y `password`, devuelve el JWT en JSON |

El resto de `/api` y todas las páginas internas requieren un JWT válido y no
revocado. `POST /api/auth/logout` requiere autenticación, revoca el token
presentado y devuelve 204; `POST /logout` revoca el token y redirige a `/login`.
La salida web también permite borrar la cookie si el JWT ya venció.
Los datos de login inválidos devuelven 400; credenciales incorrectas, 401.

El JWT dura **8 horas** y contiene `sub` (id del usuario), `jti` (identificador
aleatorio), `iat`, `exp`, `iss=freshroute` y `aud=freshroute-web-api`.
No contiene contraseña ni hash de contraseña. El rol se obtiene de MongoDB en
cada petición para aplicar los cambios de permisos inmediatamente.
La firma se verifica con una lista que admite únicamente `HS256`.

Para la web se guarda en la cookie `freshroute_session`, con `HttpOnly`,
`SameSite=Strict`, ruta `/` y `Secure` en producción (`NODE_ENV=production`,
requiere HTTPS). Para API se envía `Authorization: Bearer <access_token>`.
Si se presenta un encabezado Authorization, tiene prioridad sobre la cookie;
un encabezado inválido no utiliza una cookie como alternativa.

MongoDB guarda únicamente el hash SHA-256 del JWT, el usuario y su vencimiento.
Se requiere ese registro activo además de una firma válida: cerrar sesión
impide reutilizar el token, aunque todavía no haya vencido. La comprobación de
vencimiento no depende de la limpieza del índice TTL de MongoDB.
Las operaciones de escritura rechazan un `Origin` de otro sitio. Las respuestas
de autenticación y acceso protegido usan `Cache-Control: no-store`.

### Pruebas de JWT con Postman o curl

1. Enviá `POST http://localhost:3000/api/auth/login` con cuerpo JSON:

   ```json
   { "email": "admin@freshroute.com.ar", "password": "admin1234" }
   ```

2. La respuesta incluye `access_token`, `token_type: "Bearer"`,
   `expires_in: 28800` y datos públicos del usuario. Copiá `access_token`.
3. En Postman elegí **Authorization → Bearer Token** y pegá ese valor para
   consultar o modificar recursos de `/api`.
4. Enviá `POST /api/auth/logout` con el mismo token. Reutilizarlo devuelve 401.

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@freshroute.com.ar","password":"admin1234"}'
curl http://localhost:3000/api/clientes -H "Authorization: Bearer PEGAR_ACCESS_TOKEN"
curl -i -X POST http://localhost:3000/api/auth/logout -H "Authorization: Bearer PEGAR_ACCESS_TOKEN"
```

Los ejemplos curl usan sintaxis de Bash; en PowerShell podés usar Postman o
`Invoke-RestMethod`:

```powershell
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body (@{ email = 'admin@freshroute.com.ar'; password = 'admin1234' } | ConvertTo-Json)
$headers = @{ Authorization = "Bearer $($login.access_token)" }
Invoke-RestMethod -Uri 'http://localhost:3000/api/clientes' -Headers $headers
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/logout' -Headers $headers
```

Un JWT ausente, alterado, vencido, firmado con otra clave, de otro emisor o
audiencia, o revocado devuelve **401** en la API y redirige a `/login` en web.
Una escritura con rol `operador` devuelve **403**.

Ejecutá `npm test` para verificar JWT por cookie y Bearer, firma, vencimiento,
emisor, audiencia, algoritmo, revocación, permisos y hash de contraseñas,
además de las reglas de pedidos. Las pruebas usan un secreto propio y no
modifican la base configurada en `.env`.

Implementación basada en la [documentación oficial de jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).

## 👥 Equipo de Desarrollo

- **Maselli, Leandro:**
- **Canteros, Javier:**
- **Pelisare, Damian:**
- **Quinteros, Maximiliano:**
- **Gutierrez, Maria Cristina:**

---

## 📚 Bibliografía y Recursos

- Libro: "Clean Code" de Robert C. Martin.
- Documentación oficial de Node.js, Express.js y Pug.
- Tutoriales de Bootstrap 5 y Font Awesome.
- Artículos sobre diseño de APIs RESTful y patrones de repositorio.
- Videos sobre programación orientada a objetos en JavaScript.

📁 Drive con la doc: https://drive.google.com/drive/folders/1RrcNzOGEtzdppUzZDrnIOx8fhhwAlthj?usp=drive_link

🚀 [Mirá la demo en Render](https://dswb-2a-2c26-desarrollo-de-sistemas-web.onrender.com/)

---

para agregar sobre chatbot y websocksets:

# FreshRoute B2B — FreshBot

## 🤖 Chatbot inteligente

FreshBot es un asistente conversacional integrado en FreshRoute B2B, desarrollado para interactuar naturalmente con los usuarios y responder consultas relacionadas con la empresa.

Está construido con **Node.js, Express, Pug, Socket.IO, MongoDB y Google Gemini API**.

### Funcionalidades implementadas

- Interfaz de chat accesible desde `/chatbot`.
- Comunicación en tiempo real mediante WebSockets con Socket.IO.
- Integración con Gemini mediante el SDK oficial `@google/genai`.
- Generación de respuestas progresivas (_streaming_), mostrando el texto a medida que se genera.
- Manejo de errores de conexión, API Key y límites de cuota.
- Contexto inicial del negocio mediante instrucciones de sistema (_system prompt_).

### ¿Cómo funciona?

El flujo de comunicación se divide en cuatro etapas:

1. **Usuario:** escribe un mensaje desde la interfaz Pug.
2. **Socket.IO:** transmite el mensaje al backend.
3. **Chatbot Service:** envía el mensaje a Gemini junto con las instrucciones de contexto de FreshRoute.
4. **Respuesta:** Gemini genera el contenido progresivamente y el backend transmite los fragmentos al navegador mediante Socket.IO.

La API Key permanece exclusivamente en el backend.

### Arquitectura

```text
Frontend (Pug + JavaScript)
          │
          │ Socket.IO
          ▼
Backend (Express)
          │
          ▼
chatbot.socket.js
          │
          ▼
chatbot.service.js
          │
          │ Google GenAI SDK
          ▼
       Gemini API
          │
          │ Streaming
          ▼
Backend → Socket.IO → Frontend
```

### Contexto de FreshRoute

FreshBot cuenta con información inicial sobre el negocio:

- Empresa de logística gastronómica.
- Distribución de viandas corporativas e insumos gastronómicos refrigerados.
- Más de 120 restaurantes y comedores empresariales.
- 40 empleados distribuidos entre reparto, depósito, planificación y administración.

El asistente utiliza esta información para contextualizar sus respuestas y evitar inventar datos operativos que desconoce.

### Configuración

Crear o completar el archivo `.env`:

```env
GEMINI_API_KEY=tu_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

La API Key se obtiene desde [Google AI Studio](https://aistudio.google.com/app/apikey).

### Ejecución

Instalar las dependencias del proyecto (si todavía no están instaladas):

```bash
npm install
```

Iniciar el servidor:

```bash
npm run dev
```

o:

```bash
npm start
```

Con la aplicación en ejecución y una sesión iniciada, acceder a:

```text
http://localhost:3000/chatbot
```

### Tecnologías utilizadas

| Tecnología         | Utilización                               |
| ------------------ | ----------------------------------------- |
| Node.js + Express  | Backend y servidor HTTP                   |
| Pug                | Interfaz del chatbot                      |
| Socket.IO          | Comunicación bidireccional en tiempo real |
| Google Gemini API  | Generación de respuestas mediante IA      |
| `@google/genai`    | SDK oficial de Google                     |
| MongoDB + Mongoose | Base de datos del sistema                 |

### Próximas mejoras

- Incorporar **Gemini Function Calling** para consultar información real de MongoDB mediante funciones controladas del backend.
- Permitir consultas sobre pedidos, clientes y productos.
- Recuperar contexto de conversaciones anteriores mediante persistencia en MongoDB.
- Ampliar progresivamente las capacidades del asistente.

> **Estado actual:** chatbot funcional con Gemini, contexto de negocio y respuestas por streaming. La integración de consultas a los datos operativos de MongoDB se encuentra en desarrollo.
