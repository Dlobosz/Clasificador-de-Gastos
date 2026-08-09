// src/main/java/com/diego/Clasificador_gastos/repository/PresupuestoRepository.java
package com.diego.Clasificador_gastos.repository;

import com.diego.Clasificador_gastos.model.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
    Optional<Presupuesto> findByMes(String mes);
}
