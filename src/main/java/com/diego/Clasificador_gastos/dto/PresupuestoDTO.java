// src/main/java/com/diego/Clasificador_gastos/dto/PresupuestoDTO.java
package com.diego.Clasificador_gastos.dto;

import lombok.Builder;
import lombok.Data;

// monto viene null cuando el mes consultado todavia no tiene presupuesto
// cargado - el frontend lo interpreta como "sin definir", no como error.
@Data
@Builder
public class PresupuestoDTO {
    private String mes;
    private Double monto;
}
