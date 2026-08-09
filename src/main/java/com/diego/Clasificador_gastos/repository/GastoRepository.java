// src/main/java/com/diego/Clasificador_gastos/repository/GastoRepository.java
package com.diego.Clasificador_gastos.repository;

import com.diego.Clasificador_gastos.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByFechaBetween(LocalDate inicio, LocalDate fin);
}