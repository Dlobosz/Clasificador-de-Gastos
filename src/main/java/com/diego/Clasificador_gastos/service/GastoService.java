// src/main/java/com/diego/Clasificador_gastos/service/GastoService.java
package com.diego.Clasificador_gastos.service;

import com.diego.Clasificador_gastos.dto.GastoRequestDTO;
import com.diego.Clasificador_gastos.model.Gasto;
import com.diego.Clasificador_gastos.repository.GastoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GastoService {

    private final GastoRepository repository;

    public Gasto crearGasto(GastoRequestDTO dto) {
        Gasto gasto = Gasto.builder()
                .descripcion(dto.getDescripcion())
                .monto(dto.getMonto())
                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                .categoria(null)
                .build();
        return repository.save(gasto);
    }

    public List<Gasto> listarTodos() {
        return repository.findAll();
    }
}