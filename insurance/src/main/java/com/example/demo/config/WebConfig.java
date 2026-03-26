package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Makes uploaded files accessible via URL
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" +
                    java.nio.file.Paths.get(uploadDir)
                        .toAbsolutePath().normalize() + "/");
    }
}