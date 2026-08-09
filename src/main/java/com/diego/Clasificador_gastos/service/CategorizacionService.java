package com.diego.Clasificador_gastos.service;

import tools.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CategorizacionService {

    private static final List<String> CATEGORIAS = List.of(
            "Comida", "Transporte", "Servicios", "Ocio", "Salud", "Compras", "Otros"
    );

    private final WebClient webClient;
    private final String model;

    public CategorizacionService(
            WebClient groqWebClient,
            @Value("${groq.api.model}") String model) {
        this.webClient = groqWebClient;
        this.model = model;
    }

    
    public String clasificar(String descripcion) {
        try {
            String systemPrompt = "Eres un clasificador de gastos personales. "
                    + "Responde ÚNICAMENTE con una palabra, exactamente una de estas categorías: "
                    + String.join(", ", CATEGORIAS) + ". "
                    + "No agregues explicación, puntuación ni texto adicional.";

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", descripcion)
                    ),
                    "temperature", 0.0,
                    "max_tokens", 10
            );

            JsonNode response = webClient.post()
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            String categoriaCruda = response
                    .get("choices").get(0)
                    .get("message").get("content")
                    .asString()
                    .trim();

          
            return CATEGORIAS.stream()
                    .filter(cat -> cat.equalsIgnoreCase(categoriaCruda))
                    .findFirst()
                    .orElse("Otros");

        } catch (Exception e) {
            log.error("Error clasificando gasto con Groq: {}", e.getMessage());
            return "Otros";
        }
    }
}
