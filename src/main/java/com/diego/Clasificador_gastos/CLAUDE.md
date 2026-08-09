# Clasificador de Gastos — Contexto del proyecto

## Qué es este proyecto
Proyecto de portafolio personal (no es un examen ni un trabajo de curso). Objetivo:
un backend simple que registra gastos personales y usa IA para clasificarlos
automáticamente por categoría, y más adelante genera un resumen mensual en
lenguaje natural. Es deliberadamente simple: un solo servicio, sin microservicios,
sin autenticación, sin service discovery — la prioridad es tener un proyecto
pequeño y funcional para portafolio, no una arquitectura compleja.

## Stack
- Java 17/21, Spring Boot 4.1.0
- Spring Data JPA + Hibernate (`ddl-auto=update`, no usa Flyway en este proyecto)
- MySQL 8.0, corriendo en un contenedor Docker local (`mysql-gastos`)
- Lombok para reducir boilerplate (`@Data`, `@Builder`, etc.)
- WebClient (de `spring-boot-starter-webflux`) para llamar APIs externas
- Groq API (modelo `llama-3.1-8b-instant`, gratuito) para clasificar gastos por categoría
- Variables sensibles (`DB_PASSWORD`, `GROQ_API_KEY`) van en un archivo `.env`
  en la raíz, cargado vía `envFile` en `.vscode/launch.json`. El `.env` está en
  `.gitignore` y NUNCA debe commitearse (ya tuvimos un susto con GitHub Push
  Protection bloqueando un push por esto — no se debe repetir).

## Estructura de paquetes
```
com.diego.Clasificador_gastos/
├── model/Gasto.java              — entidad JPA (id, descripcion, monto, fecha, categoria)
├── dto/GastoRequestDTO.java       — DTO de entrada para crear un gasto
├── dto/ResumenMensualDTO.java     — DTO de salida del resumen mensual
├── repository/GastoRepository.java — incluye findByFechaBetween(inicio, fin)
├── config/GroqConfig.java         — bean compartido del WebClient de Groq (URL + API key)
├── service/GastoService.java      — orquesta creación de gastos, llama a CategorizacionService
├── service/CategorizacionService.java — llama a Groq para clasificar la descripción en una categoría fija
├── service/ResumenService.java    — agrega gastos del mes por categoría y le pide a Groq un resumen en texto
└── controller/GastoController.java — expone POST/GET /api/v1/gastos y GET /api/v1/gastos/resumen
```

## Estado actual (qué YA funciona, probado)
- CRUD básico de gastos: crear (`POST /api/v1/gastos`) y listar (`GET /api/v1/gastos`)
  funcionando end-to-end contra MySQL en Docker — confirmado con Thunder Client.
- Conexión a MySQL resuelta (requirió agregar `allowPublicKeyRetrieval=true` y
  `ddl-auto=update` a `application.properties` — sin esto la tabla `gastos`
  nunca se crea y Hibernate falla).
- `CategorizacionService` implementado: llama a Groq con una lista fija de
  categorías (Comida, Transporte, Servicios, Ocio, Salud, Compras, Otros),
  `temperature: 0.0`, valida que la respuesta del modelo coincida exactamente
  con una categoría conocida (si no, cae en "Otros" como fallback seguro).
- `GastoService.crearGasto()` ya llama a `CategorizacionService.clasificar()`
  antes de guardar el gasto.
- **Clasificación automática con Groq confirmada funcionando end-to-end**
  (2026-08-09): se probó con curl contra `POST /api/v1/gastos` con 5
  descripciones distintas (comida, transporte, servicios, salud, ocio) y las
  5 categorías se asignaron correctamente. De paso se encontró y corrigió un
  bug real de compilación: Spring Boot 4.1.0 usa Jackson 3
  (paquete `tools.jackson.*`, no `com.fasterxml.jackson.*`), así que
  `CategorizacionService.java` no compilaba (`JsonNode` no resuelto).
  Se agregó `spring-boot-starter-json` al `pom.xml` (no incluido por
  `spring-boot-starter-webmvc` solo) y se corrigió el import. Commit
  `e49e723`, ya pusheado a `main`.
- **Endpoint de resumen mensual implementado y probado** (2026-08-09):
  `GET /api/v1/gastos/resumen?mes=yyyy-MM`. `ResumenService` trae los gastos
  del mes (`GastoRepository.findByFechaBetween`), suma los montos por
  categoría **en Java** (no delegado al LLM, para que los totales sean
  exactos) y le pide a Groq (mismo modelo `llama-3.1-8b-instant`,
  `temperature: 0.4`) que redacte un resumen ejecutivo breve en español a
  partir de ese desglose. Si no hay gastos ese mes, responde sin llamar a
  Groq. Si Groq falla, igual devuelve los totales calculados con un mensaje
  de fallback. Se extrajo `GroqConfig` como bean compartido de `WebClient`
  para no duplicar esa configuración entre `CategorizacionService` y
  `ResumenService`. De paso se corrigió `JsonNode.asText()` → `asString()`
  (deprecado en Jackson 3, el que usa Spring Boot 4.1). Commit `bb68f9b`,
  ya pusheado a `main`.
  - Nota conocida: el texto que redacta Groq a veces incluye porcentajes que
    no cuadran matemáticamente (los LLMs no son confiables haciendo
    aritmética). No afecta a `totalGastado` ni `totalPorCategoria`, que se
    calculan en Java. Si en algún momento importa que el texto no tenga
    números potencialmente erróneos, ajustar el prompt para que no mencione
    cifras y dejar que el consumidor combine texto + totales exactos.
- Con esto, el proyecto llegó a su primera versión "completa" según el
  objetivo original (CRUD + clasificación automática + resumen mensual).

## Pendiente / a verificar
- El paquete se llama `com.diego.Clasificador_gastos` (con mayúscula y guión
  bajo) — no sigue la convención estándar de Java (debería ser todo minúsculas
  sin guión bajo). Se dejó así a propósito por ahora, no es prioritario
  renombrarlo.
- Hay un archivo suelto `tatus` en la raíz del repo (quedó commiteado en
  `610aeb0`) que parece un artefacto accidental, no un archivo de proyecto
  real — revisar si se puede borrar.
- El README todavía no se actualizó para reflejar el resumen mensual ni
  cómo levantar el proyecto end-to-end (Docker + `.env` + Groq key).

## Preferencias de Diego para trabajar en este proyecto
- Prefiere explicaciones detalladas del "por qué", no solo el "qué" — quiere
  entender las decisiones, no solo copiar código.
- Prefiere ir paso a paso, confirmando que cada parte funciona antes de seguir
  a la siguiente (no avanzar varios pasos a la vez sin probar).
- El proyecto es para portafolio: buenas prácticas visibles (sin secretos en
  el código, README claro) importan tanto como que funcione.
- Está usando VS Code como entorno principal, con Thunder Client para probar
  endpoints y la extensión MySQL para revisar la base de datos.