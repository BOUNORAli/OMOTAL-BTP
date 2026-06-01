FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests -Dmaven.wagon.http.retryHandler.count=3 package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/omotal-backend-0.1.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
