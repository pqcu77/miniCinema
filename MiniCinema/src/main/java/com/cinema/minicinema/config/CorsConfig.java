package com.cinema.minicinema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 跨域配置
 * 允许前端从不同端口（如 localhost:8001）访问后端 API
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 使用 allowedOriginPatterns 以支持带端口的 localhost 任意端口（开发环境下更灵活）
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "http://localhost",
                        "http://127.0.0.1"
                )
                // 允许的 HTTP 方法
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // 允许的请求头
                .allowedHeaders("*")
                // 允许证书（cookies）
                .allowCredentials(true)
                // 缓存预检请求的结果，单位秒
                .maxAge(3600);
    }
}
