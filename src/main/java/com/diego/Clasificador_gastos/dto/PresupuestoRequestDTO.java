// src/main/java/com/diego/Clasificador_gastos/dto/PresupuestoRequestDTO.java
package com.diego.Clasificador_gastos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PresupuestoRequestDTO {
    @NotNull
    @Positive
    private Double monto;
}
