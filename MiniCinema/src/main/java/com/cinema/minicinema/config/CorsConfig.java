package com.cinema.minicinema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 跨域配置
 * 允许前端从不同端口（如 localhost:5500）访问后端 API
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 允许的来源（前端地址）- 支持本地、ngrok 等多种环境
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://*.ngrok-free.dev",
                        "https://*.ngrok.dev",
                        "file://*"
                )
                // 允许的 HTTP 方法
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // 允许的请求头 - 明确列出而不是用 *
                .allowedHeaders("*")
                //.allowedHeaders("Content-Type", "Authorization", "X-Requested-With", "Accept")
                // 允许证书（cookies）
                .allowCredentials(true)
                // 缓存预检请求的结果，单位秒
                .maxAge(3600)
                .exposedHeaders("Authorization", "Content-Type", "X-Total-Count");
    }
}
