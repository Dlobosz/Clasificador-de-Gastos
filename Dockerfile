# --- Etapa 1: build del frontend (Vite + React) ---
# El outDir de vite.config.js ("../src/main/resources/static") es relativo
# a /app/frontend, asi que termina escribiendo en /app/src/main/resources/static
# dentro de esta misma etapa. Por eso mantenemos la misma estructura de
# carpetas que en el repo (WORKDIR /app, no /app/frontend a secas).
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
RUN cd frontend && npm run build

# --- Etapa 2: build del backend (Maven + Java 21) ---
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src src
# Pisa el src/main/resources/static que viene commiteado en el repo
# (el build de la ultima vez que corriste "npm run build" a mano) con
# el build fresco que acaba de generar la etapa anterior.
COPY --from=frontend-build /app/src/main/resources/static src/main/resources/static
RUN mvn -B package -DskipTests

# --- Etapa 3: runtime, solo el JRE + el jar final ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
