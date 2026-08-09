package com.diego.Clasificador_gastos.service;

import com.diego.Clasificador_gastos.dto.GastoRequestDTO;
import com.diego.Clasificador_gastos.dto.GastoUpdateDTO;
import com.diego.Clasificador_gastos.model.Gasto;
import com.diego.Clasificador_gastos.repository.GastoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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
                .esRecurrente(Boolean.TRUE.equals(dto.getEsRecurrente()))
                .build();

        return repository.save(gasto);
    }

    public List<Gasto> listarTodos() {
        return repository.findAll();
    }

    public Gasto actualizarGasto(Long id, GastoUpdateDTO dto) {
        Gasto gasto = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe un gasto con id " + id));

        if (!CategoriasFijas.TODAS.contains(dto.getCategoria())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Categoría inválida. Debe ser una de: " + CategoriasFijas.TODAS);
        }

        gasto.setMonto(dto.getMonto());
        gasto.setCategoria(dto.getCategoria());
        gasto.setFecha(dto.getFecha());
        gasto.setEsRecurrente(dto.getEsRecurrente());

        return repository.save(gasto);
    }
}