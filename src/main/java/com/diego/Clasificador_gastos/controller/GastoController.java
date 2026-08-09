// src/main/java/com/diego/Clasificador_gastos/controller/GastoController.java
package com.diego.Clasificador_gastos.controller;

import com.diego.Clasificador_gastos.dto.GastoRequestDTO;
import com.diego.Clasificador_gastos.dto.ResumenMensualDTO;
import com.diego.Clasificador_gastos.model.Gasto;
import com.diego.Clasificador_gastos.service.GastoService;
import com.diego.Clasificador_gastos.service.ResumenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/gastos")
@RequiredArgsConstructor
public class GastoController {

    private final GastoService service;
    private final ResumenService resumenService;

    @PostMapping
    public ResponseEntity<Gasto> crear(@Valid @RequestBody GastoRequestDTO dto) {
        Gasto creado = service.crearGasto(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Gasto>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/resumen")
    public ResponseEntity<?> resumen(@RequestParam String mes) {
        YearMonth yearMonth;
        try {
            yearMonth = YearMonth.parse(mes);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest()
                    .body("Formato de mes inválido. Usa yyyy-MM, ej: 2026-08");
        }
        return ResponseEntity.ok(resumenService.generarResumen(yearMonth));
    }
}
