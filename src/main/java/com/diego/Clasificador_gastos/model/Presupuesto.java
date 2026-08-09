// src/main/java/com/diego/Clasificador_gastos/model/Presupuesto.java
package com.diego.Clasificador_gastos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Ingreso/presupuesto que el usuario carga a mano para un mes puntual
// (formato "yyyy-MM", igual que el que ya usa el resumen mensual). Un
// registro por mes; se usa para calcular cuanto se lleva gastado del
// presupuesto y para que la IA arme consejos de ahorro con esa referencia.
@Entity
@Table(name = "presupuestos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String mes;

    @Positive
    @Column(nullable = false)
    private Double monto;
}
