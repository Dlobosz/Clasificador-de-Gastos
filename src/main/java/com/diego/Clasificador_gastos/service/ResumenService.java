// src/main/java/com/diego/Clasificador_gastos/service/ResumenService.java
package com.diego.Clasificador_gastos.service;

import com.diego.Clasificador_gastos.dto.ResumenMensualDTO;
import com.diego.Clasificador_gastos.model.Gasto;
import com.diego.Clasificador_gastos.repository.GastoRepository;
import com.diego.Clasificador_gastos.repository.PresupuestoRepository;
import lombok.RequiredArgsConstructor;
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
    private final PresupuestoRepository presupuestoRepository;
    private final WebClient webClient;
    private final String model;

    public ResumenService(
            GastoRepository repository,
            PresupuestoRepository presupuestoRepository,
            WebClient groqWebClient,
            @Value("${groq.api.model}") String model) {
        this.repository = repository;
        this.presupuestoRepository = presupuestoRepository;
        this.webClient = groqWebClient;
        this.model = model;
    }

    public ResumenMensualDTO generarResumen(YearMonth mes) {
        List<Gasto> gastos = repository.findByFechaBetween(mes.atDay(1), mes.atEndOfMonth());
        Double presupuesto = presupuestoRepository.findByMes(mes.toString())
                .map(com.diego.Clasificador_gastos.model.Presupuesto::getMonto)
                .orElse(null);

        if (gastos.isEmpty()) {
            return ResumenMensualDTO.builder()
                    .mes(mes.toString())
                    .totalGastado(0.0)
                    .cantidadGastos(0)
                    .totalPorCategoria(Map.of())
                    .presupuesto(presupuesto)
                    .porcentajeUsado(presupuesto != null ? 0.0 : null)
                    .consejosAhorro("No hay gastos registrados para " + mes + ".")
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

        List<Gasto> recurrentes = gastos.stream().filter(Gasto::isEsRecurrente).toList();
        Double porcentajeUsado = presupuesto != null ? (totalGastado / presupuesto) * 100 : null;

        String consejosAhorro = generarConsejosConGroq(
                mes, totalPorCategoria, totalGastado, gastos.size(), presupuesto, porcentajeUsado, recurrentes);

        return ResumenMensualDTO.builder()
                .mes(mes.toString())
                .totalGastado(totalGastado)
                .cantidadGastos(gastos.size())
                .totalPorCategoria(totalPorCategoria)
                .presupuesto(presupuesto)
                .porcentajeUsado(porcentajeUsado)
                .consejosAhorro(consejosAhorro)
                .build();
    }

    private String generarConsejosConGroq(
            YearMonth mes, Map<String, Double> totalPorCategoria, double totalGastado,
            int cantidadGastos, Double presupuesto, Double porcentajeUsado, List<Gasto> recurrentes) {
        try {
            String detalle = totalPorCategoria.entrySet().stream()
                    .map(e -> "- %s: $%.0f".formatted(e.getKey(), e.getValue()))
                    .collect(Collectors.joining("\n"));

            String lineaPresupuesto = presupuesto != null
                    ? "Presupuesto del mes: $%.0f (usado %.0f%%)".formatted(presupuesto, porcentajeUsado)
                    : "Presupuesto del mes: no definido";

            String lineaRecurrentes = recurrentes.isEmpty()
                    ? "Gastos recurrentes (suscripciones, cuentas fijas): ninguno marcado"
                    : "Gastos recurrentes (suscripciones, cuentas fijas): %d, por un total de $%.0f (%s)".formatted(
                            recurrentes.size(),
                            recurrentes.stream().mapToDouble(Gasto::getMonto).sum(),
                            recurrentes.stream().map(Gasto::getDescripcion).collect(Collectors.joining(", ")));

            String userContent = """
                    Mes: %s
                    Total gastado: $%.0f
                    Cantidad de gastos: %d
                    %s
                    %s
                    Desglose por categoría:
                    %s
                    """.formatted(mes, totalGastado, cantidadGastos, lineaPresupuesto, lineaRecurrentes, detalle);

            String systemPrompt = "Eres un asesor financiero personal cercano y práctico. A partir de los "
                    + "datos de gastos de un usuario, escribe entre 3 y 5 consejos breves y accionables "
                    + "para ahorrar mejor, en español, en un párrafo fluido (sin viñetas ni markdown), "
                    + "máximo 120 palabras. Incluí al menos un consejo general sobre cuándo conviene usar "
                    + "débito, crédito o efectivo. Priorizá consejos sobre las categorías donde más gastó, "
                    + "sobre sus gastos recurrentes si tiene, y sobre si se pasó o no de su presupuesto. "
                    + "No repitas los montos exactos, enfocate en la acción a tomar. Usa solo los datos "
                    + "entregados, no inventes categorías ni cifras.";

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userContent)
                    ),
                    "temperature", 0.5,
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
            log.error("Error generando consejos de ahorro con Groq: {}", e.getMessage());
            return "No se pudieron generar consejos en este momento (falló la conexión con Groq), "
                    + "pero podés revisar tu desglose por categoría para identificar dónde ahorrar.";
        }
    }
}
