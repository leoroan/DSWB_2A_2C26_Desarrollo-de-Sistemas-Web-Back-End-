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
      clúster en el paso de *Security Quickstart*).
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
- **Documentación 1er entrega:** `http://localhost:3000/documentacion`
- **Endpoints de la API REST:** `http://localhost:3000/api` (para que podamos probar con Postman)

---

## Inicio de sesión

Antes de acceder a las páginas internas, la aplicación solicita correo y contraseña
en `/login`. Para crear un usuario en la base configurada en `.env`, ejecutá:

```bash
npm run user:create
```

El comando solicita nombre, correo y contraseña (entre 8 y 256 caracteres).
Las contraseñas se almacenan en texto plano según los requisitos de esta entrega
académica. No uses contraseñas de otras cuentas.
Luego ejecutá `npm start` y accedé a `http://localhost:3000`.
La sesión dura 8 horas y el botón **Cerrar sesión** la invalida.
Las rutas `/api` siguen disponibles sin login para las pruebas con Postman.
En producción, las cookies de sesión requieren HTTPS.

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
