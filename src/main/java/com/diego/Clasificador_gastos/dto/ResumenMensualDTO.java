// src/main/java/com/diego/Clasificador_gastos/dto/ResumenMensualDTO.java
package com.diego.Clasificador_gastos.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ResumenMensualDTO {
    private String mes;
    private double totalGastado;
    private int cantidadGastos;
    private Map<String, Double> totalPorCategoria;

    // Null si el mes todavia no tiene presupuesto cargado (ver
    // PresupuestoController). porcentajeUsado tambien queda null en ese
    // caso, no tiene sentido calcularlo sin presupuesto de referencia.
    private Double presupuesto;
    private Double porcentajeUsado;

    // Consejos de ahorro personalizados que redacta Groq (categorias
    // donde mas se gasto, gastos recurrentes, uso del presupuesto).
    // Reemplaza al resumen ejecutivo generico que tenia el proyecto
    // antes: es mas accionable que simplemente repetir los totales.
    private String consejosAhorro;
}
