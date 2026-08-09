package com.diego.Clasificador_gastos.service;

import java.util.List;

// Lista fija de categorias de gasto usada en todo el proyecto:
// - CategorizacionService la usa como opciones validas para Groq.
// - GastoService la usa para validar una categoria elegida a mano
//   (edicion manual, ver GastoUpdateDTO).
// - GastoController la expone via GET /api/v1/gastos/categorias para
//   que el frontend arme el dropdown sin duplicar esta lista.
public final class CategoriasFijas {

    public static final List<String> TODAS = List.of(
            "Comida", "Transporte", "Servicios", "Ocio", "Salud", "Compras", "Otros"
    );

    private CategoriasFijas() {
    }
}
