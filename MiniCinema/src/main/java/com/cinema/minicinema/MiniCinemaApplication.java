package com.cinema.minicinema;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.cinema.minicinema.Mapper") // 修改为 UserMapper 的实际包路径
public class MiniCinemaApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiniCinemaApplication.class, args);
    }
}