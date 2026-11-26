# Build the Spring Boot application with Maven and Java 21.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /backend

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q package -DskipTests

# Run with a smaller JRE image and an unprivileged user.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /backend

RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/data \
    && chown -R spring:spring /app

COPY --from=build --chown=spring:spring /backend/target/*.jar /app/app.jar

USER spring:spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
