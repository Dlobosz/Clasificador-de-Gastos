// src/main/java/com/diego/Clasificador_gastos/service/PresupuestoService.java
package com.diego.Clasificador_gastos.service;

import com.diego.Clasificador_gastos.dto.PresupuestoDTO;
import com.diego.Clasificador_gastos.model.Presupuesto;
import com.diego.Clasificador_gastos.repository.PresupuestoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private final PresupuestoRepository repository;

    public PresupuestoDTO obtener(YearMonth mes) {
        Double monto = repository.findByMes(mes.toString())
                .map(Presupuesto::getMonto)
                .orElse(null);
        return PresupuestoDTO.builder().mes(mes.toString()).monto(monto).build();
    }

    // Upsert: si el mes ya tiene presupuesto cargado lo actualiza, si no
    // crea uno nuevo. Es la operacion que usa tanto "cargar por primera
    // vez" como "editar" desde el frontend, no hace falta distinguirlas.
    public PresupuestoDTO guardar(YearMonth mes, Double monto) {
        Presupuesto presupuesto = repository.findByMes(mes.toString())
                .orElse(Presupuesto.builder().mes(mes.toString()).build());
        presupuesto.setMonto(monto);
        repository.save(presupuesto);
        return PresupuestoDTO.builder().mes(mes.toString()).monto(monto).build();
    }
}
