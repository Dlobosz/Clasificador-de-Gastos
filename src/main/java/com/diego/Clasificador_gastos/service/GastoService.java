package com.diego.Clasificador_gastos.service;

import com.diego.Clasificador_gastos.dto.GastoRequestDTO;
import com.diego.Clasificador_gastos.model.Gasto;
import com.diego.Clasificador_gastos.repository.GastoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GastoService {

    private final GastoRepository repository;
    private final CategorizacionService categorizacionService;

    public Gasto crearGasto(GastoRequestDTO dto) {
        log.info("Clasificando gasto: {}", dto.getDescripcion());
        String categoria = categorizacionService.clasificar(dto.getDescripcion());
        log.info("Categoría asignada: {}", categoria);

        Gasto gasto = Gasto.builder()
                .descripcion(dto.getDescripcion())
                .monto(dto.getMonto())
                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                .categoria(categoria)
                .build();

        return repository.save(gasto);
    }

    public List<Gasto> listarTodos() {
        return repository.findAll();
    }
}