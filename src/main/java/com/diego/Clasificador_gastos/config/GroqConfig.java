// src/main/java/com/diego/Clasificador_gastos/config/GroqConfig.java
package com.diego.Clasificador_gastos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Bean compartido del WebClient de Groq. Antes cada servicio armaba su propio
 * WebClient con la URL y el API key — se centraliza acá para no duplicar esa
 * configuración a medida que se agregan más servicios que llaman a Groq.
 */
@Configuration
public class GroqConfig {

    @Bean
    public WebClient groqWebClient(
            @Value("${groq.api.url}") String url,
            @Value("${groq.api.key}") String apiKey) {
        return WebClient.builder()
                .baseUrl(url)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
