// src/main/java/com/diego/Clasificador_gastos/repository/GastoRepository.java
package com.diego.Clasificador_gastos.repository;

import com.diego.Clasificador_gastos.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
}