// src/main/java/com/diego/Clasificador_gastos/controller/PresupuestoController.java
package com.diego.Clasificador_gastos.controller;

import com.diego.Clasificador_gastos.dto.PresupuestoDTO;
import com.diego.Clasificador_gastos.dto.PresupuestoRequestDTO;
import com.diego.Clasificador_gastos.service.PresupuestoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/v1/presupuestos")
@RequiredArgsConstructor
public class PresupuestoController {

    private final PresupuestoService service;

    @GetMapping("/{mes}")
    public ResponseEntity<?> obtener(@PathVariable String mes) {
        YearMonth yearMonth = parsearMes(mes);
        if (yearMonth == null) return mesInvalido();
        return ResponseEntity.ok(service.obtener(yearMonth));
    }

    @PutMapping("/{mes}")
    public ResponseEntity<?> guardar(
            @PathVariable String mes, @Valid @RequestBody PresupuestoRequestDTO dto) {
        YearMonth yearMonth = parsearMes(mes);
        if (yearMonth == null) return mesInvalido();
        return ResponseEntity.ok(service.guardar(yearMonth, dto.getMonto()));
    }

    private YearMonth parsearMes(String mes) {
        try {
            return YearMonth.parse(mes);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private ResponseEntity<PresupuestoDTO> mesInvalido() {
        return ResponseEntity.badRequest().build();
    }
}
