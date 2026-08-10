# 💸 Clasificador de Gastos

Sistema de trackeo de gastos personales que usa Inteligencia Artificial para clasificar automáticamente cada gasto por categoría, generar un resumen mensual en lenguaje natural, y llevar el control de un presupuesto mensual.

---

## 📌 Por qué nació este proyecto

Este proyecto nació con un objetivo doble: por un lado, tener una **herramienta real de trackeo de gastos y ahorro** — algo que efectivamente pudiera usar para entender en qué se me va el dinero cada mes. Por otro lado, y ese fue el motivo principal, quería **aprender a integrar Inteligencia Artificial en un sistema de software real**, más allá de usarla como un chatbot aparte: que la IA analizara datos financieros reales, los clasificara, y diera contexto y orientación útil sobre los gastos y el ahorro, en vez de ser solo una funcionalidad decorativa.

Es un proyecto de portafolio, pensado para ser pequeño, funcional, y terminado de principio a fin — antes que grande e incompleto.

### Cómo se construyó

El desarrollo se hizo en etapas claramente diferenciadas, y quiero dejarlo documentado porque fue parte importante del proceso de aprendizaje:

- **El backend y la base de datos se escribieron a mano**, entidad por entidad, servicio por servicio — guiándome y auditándome en cada paso con ayuda de IA (explicaciones del por qué de cada decisión, debugging de errores de conexión, arreglo de bugs de compilación, revisión de buenas prácticas). El código lo escribí yo; la IA fue guía, tutor y auditor durante todo el proceso.
- **El frontend fue construido concretamente por IA** (usando Claude Code), con intervención humana puntual para ajustes y decisiones de producto. A diferencia del backend, acá delegué la escritura del código en sí, pero mantuve el control sobre qué se construía y por qué.
- **Las conexiones externas (la integración con la API de Groq, las variables de entorno, las credenciales, el despliegue) las hice yo mismo, a mano, sin intervención de IA** en su creación — es la parte que consideré más importante entender y controlar directamente, dado que ahí es donde vive lo sensible del proyecto (API keys, configuración de producción).

---

## ✨ Qué hace

- **Registrar gastos**: descripción, monto y fecha.
- **Clasificación automática por IA**: cada gasto se clasifica solo en una categoría (Comida, Transporte, Servicios, Ocio, Salud, Compras, Otros) usando un modelo de lenguaje (Groq, `llama-3.1-8b-instant`) — sin que el usuario tenga que elegirla a mano.
- **Edición manual de gastos**: si la IA se equivoca o quieres ajustar algo, se puede editar el gasto y su categoría después.
- **Resumen mensual en lenguaje natural**: junta los gastos de un mes, calcula los totales por categoría (en código, no con IA, para que los números sean exactos), y le pide a la IA que redacte un resumen ejecutivo breve destacando en qué se gastó más y observaciones útiles.
- **Presupuesto mensual**: se puede cargar un monto de presupuesto por mes, como referencia para comparar contra lo gastado.
- **Interfaz visual**: frontend en React con formulario de carga, tabla de gastos, gráfico por categoría, y la vista de resumen mensual — no es solo una API, se puede usar como una app real.

---

## 🏗️ Arquitectura y stack

**Backend**
- Java 21 + Spring Boot 4.1.0
- Spring Data JPA + Hibernate (`ddl-auto=update`)
- MySQL 8
- Spring Validation (`@NotBlank`, `@Positive`, etc.)
- WebClient para consumir la API de Groq
- Lombok

**Frontend**
- React 19 + Vite
- Consume la API del backend vía `fetch`

**Infraestructura**
- Docker (MySQL en desarrollo local)
- Dockerfile multi-stage: compila el frontend, lo empaqueta como recursos estáticos del backend, y arma un único `.jar` desplegable — el backend sirve tanto la API como el frontend ya compilado.
- Preparado para desplegarse en Railway (variables de entorno `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, `GROQ_API_KEY` configurables sin tocar código).

El proyecto sigue una **arquitectura en capas** clásica de Spring Boot: `controller` (recibe HTTP) → `service` (lógica de negocio) → `repository` (acceso a datos), con una capa `config` para la configuración compartida del cliente de IA.

---

## 📂 Estructura del proyecto

```
Clasificador-de-Gastos/
├── src/main/java/com/diego/Clasificador_gastos/
│   ├── model/           → entidades JPA (Gasto, Presupuesto)
│   ├── dto/              → objetos de entrada/salida de la API
│   ├── repository/       → acceso a la base de datos (Spring Data JPA)
│   ├── config/           → configuración del cliente HTTP hacia Groq
│   ├── service/          → lógica de negocio (clasificación, resumen, presupuesto)
│   └── controller/       → endpoints REST
├── src/main/resources/
│   ├── application.properties
│   └── static/            → build del frontend, servido directamente por Spring Boot
├── frontend/
│   ├── src/
│   │   ├── api/            → llamadas HTTP al backend
│   │   ├── components/     → formulario, tabla, gráfico, resumen, presupuesto
│   │   └── utils/
│   └── package.json
├── Dockerfile               → build multi-stage (frontend + backend en un solo jar)
└── pom.xml
```

---

## 🔌 Endpoints principales

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/v1/gastos` | Crea un gasto, lo clasifica automáticamente con IA |
| `GET` | `/api/v1/gastos` | Lista todos los gastos |
| `PUT` | `/api/v1/gastos/{id}` | Edita un gasto (incluida su categoría) |
| `GET` | `/api/v1/gastos/categorias` | Lista las categorías disponibles |
| `GET` | `/api/v1/gastos/resumen?mes=yyyy-MM` | Resumen mensual: totales por categoría + texto generado por IA |
| `GET` | `/api/v1/presupuestos/{mes}` | Obtiene el presupuesto cargado para un mes (`yyyy-MM`) |
| `PUT` | `/api/v1/presupuestos/{mes}` | Carga o actualiza el presupuesto de un mes |

---

## 🚀 Cómo usarlo (desarrollo local)

### Prerrequisitos
- Java 21
- Node.js 20+
- Docker
- Una API key gratuita de [Groq](https://console.groq.com/keys)

### 1. Levantar la base de datos

```bash
docker run --name mysql-gastos \
  -e MYSQL_ROOT_PASSWORD=tu_password \
  -e MYSQL_DATABASE=clasificador_gastos \
  -p 3306:3306 \
  -d mysql:8.0
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```
DB_PASSWORD=tu_password
GROQ_API_KEY=gsk_tu_key_de_groq
```

> El `.env` está en `.gitignore` — nunca se sube al repositorio.

### 3. Levantar el backend

```bash
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

### 4. Levantar el frontend (modo desarrollo)

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`, consumiendo la API del backend.

### 5. (Opcional) Build único con Docker

Para levantar todo el proyecto (frontend + backend) como un solo contenedor, tal como quedaría en producción:

```bash
docker build -t clasificador-gastos .
docker run -p 8080:8080 --env-file .env clasificador-gastos
```

En este caso, el frontend ya viene compilado y se sirve directamente desde `http://localhost:8080`.

---

## 🧠 Sobre el uso de IA en este proyecto

Este proyecto usa IA en dos capas distintas, a propósito:

1. **Clasificación de gastos**: se le pide al modelo que responda únicamente con una categoría de una lista cerrada — la respuesta se valida en código contra esa lista antes de guardarla, así el sistema nunca queda con una categoría inválida o inventada.
2. **Redacción del resumen mensual**: los totales y sumas los calcula el backend en Java, no la IA — a los modelos de lenguaje no se les debe confiar aritmética exacta. La IA solo entra para **redactar** el resumen en lenguaje natural a partir de números ya calculados y verificados.

Este diseño (la IA propone/redacta, el código valida/calcula) fue una decisión deliberada durante el desarrollo, no un detalle menor.

---

## 🗺️ Posibles próximos pasos

- Consejos de ahorro más elaborados, comparando el gasto real contra el presupuesto cargado.
- Historial y comparación entre meses.
- Autenticación para soportar múltiples usuarios.
