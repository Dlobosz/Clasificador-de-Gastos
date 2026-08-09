// src/main/java/com/diego/Clasificador_gastos/dto/GastoUpdateDTO.java
package com.diego.Clasificador_gastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

// DTO para PUT /api/v1/gastos/{id}. A diferencia de la creacion, aca la
// descripcion no se puede editar (si cambia la descripcion deberia
// re-clasificarse el gasto, y eso es otro caso de uso); lo editable es
// monto, categoria (a mano, pisando lo que haya asignado la IA), fecha
// y si es un gasto recurrente.
@Data
public class GastoUpdateDTO {

    @NotNull
    @Positive
    private Double monto;

    @NotBlank
    private String categoria;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private Boolean esRecurrente;
}
