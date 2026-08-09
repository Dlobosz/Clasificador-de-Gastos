// src/main/java/com/diego/Clasificador_gastos/model/Gasto.java
package com.diego.Clasificador_gastos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Entity
@Table(name = "gastos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String descripcion;

    @Positive
    @Column(nullable = false)
    private Double monto;

    @Column(nullable = false)
    private LocalDate fecha;

    private String categoria;

    // Marcado a mano por el usuario (no lo decide la IA) para gastos que
    // se repiten mes a mes: suscripciones, cuentas del hogar, etc.
    // @ColumnDefault hace que, al agregar esta columna a una tabla que ya
    // tiene filas (via ddl-auto=update), MySQL las rellene con 0/false en
    // vez de dejarlas en NULL — evita que Hibernate rompa al leer un NULL
    // en un campo primitivo boolean.
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean esRecurrente = false;
}