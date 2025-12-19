package com.cinema.minicinema;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
// only scan interfaces annotated with @Mapper to avoid scanning MovieMapper (implemented by MovieMapperAdapter)
@MapperScan(value = "com.cinema.minicinema.Mapper", annotationClass = org.apache.ibatis.annotations.Mapper.class)
public class MiniCinemaApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiniCinemaApplication.class, args);
    }
}