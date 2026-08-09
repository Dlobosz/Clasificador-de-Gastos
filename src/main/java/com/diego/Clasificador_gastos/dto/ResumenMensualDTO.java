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
    private String resumenTexto;
}
