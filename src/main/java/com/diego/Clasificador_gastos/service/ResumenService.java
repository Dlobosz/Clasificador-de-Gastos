// src/main/java/com/diego/Clasificador_gastos/service/ResumenService.java
package com.diego.Clasificador_gastos.service;

import com.diego.Clasificador_gastos.dto.ResumenMensualDTO;
import com.diego.Clasificador_gastos.model.Gasto;
import com.diego.Clasificador_gastos.repository.GastoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.JsonNode;

import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ResumenService {

    private final GastoRepository repository;
    private final WebClient webClient;
    private final String model;

    public ResumenService(
            GastoRepository repository,
            WebClient groqWebClient,
            @Value("${groq.api.model}") String model) {
        this.repository = repository;
        this.webClient = groqWebClient;
        this.model = model;
    }

    public ResumenMensualDTO generarResumen(YearMonth mes) {
        List<Gasto> gastos = repository.findByFechaBetween(mes.atDay(1), mes.atEndOfMonth());

        if (gastos.isEmpty()) {
            return ResumenMensualDTO.builder()
                    .mes(mes.toString())
                    .totalGastado(0.0)
                    .cantidadGastos(0)
                    .totalPorCategoria(Map.of())
                    .resumenTexto("No hay gastos registrados para " + mes + ".")
                    .build();
        }

        Map<String, Double> totalPorCategoria = gastos.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getCategoria() != null ? g.getCategoria() : "Sin categoría",
                        LinkedHashMap::new,
                        Collectors.summingDouble(Gasto::getMonto)
                ));

        double totalGastado = totalPorCategoria.values().stream()
                .mapToDouble(Double::doubleValue)
                .sum();

        String resumenTexto = generarTextoConGroq(mes, totalPorCategoria, totalGastado, gastos.size());

        return ResumenMensualDTO.builder()
                .mes(mes.toString())
                .totalGastado(totalGastado)
                .cantidadGastos(gastos.size())
                .totalPorCategoria(totalPorCategoria)
                .resumenTexto(resumenTexto)
                .build();
    }

    private String generarTextoConGroq(YearMonth mes, Map<String, Double> totalPorCategoria,
                                        double totalGastado, int cantidadGastos) {
        try {
            String detalle = totalPorCategoria.entrySet().stream()
                    .map(e -> "- %s: $%.0f".formatted(e.getKey(), e.getValue()))
                    .collect(Collectors.joining("\n"));

            String userContent = """
                    Mes: %s
                    Total gastado: $%.0f
                    Cantidad de gastos: %d
                    Desglose por categoría:
                    %s
                    """.formatted(mes, totalGastado, cantidadGastos, detalle);

            String systemPrompt = "Eres un asistente financiero personal. Recibes un resumen de gastos "
                    + "mensuales agrupados por categoría y debes escribir un resumen ejecutivo breve "
                    + "(máximo 4 oraciones), en español, en tono cercano y natural, destacando en qué "
                    + "se gastó más y cualquier observación útil. Usa solo los datos entregados, no "
                    + "inventes categorías ni montos.";

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userContent)
                    ),
                    "temperature", 0.4,
                    "max_tokens", 300
            );

            JsonNode response = webClient.post()
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return response
                    .get("choices").get(0)
                    .get("message").get("content")
                    .asString()
                    .trim();

        } catch (Exception e) {
            log.error("Error generando resumen con Groq: {}", e.getMessage());
            return "No se pudo generar el resumen en lenguaje natural (falló la conexión con Groq), "
                    + "pero los totales por categoría sí están disponibles.";
        }
    }
}
