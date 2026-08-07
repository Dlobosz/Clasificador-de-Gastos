// src/main/java/com/diego/Clasificador_gastos/dto/GastoRequestDTO.java
package com.diego.Clasificador_gastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GastoRequestDTO {
    @NotBlank
    private String descripcion;

    @Positive
    private Double monto;

    private LocalDate fecha;
}
