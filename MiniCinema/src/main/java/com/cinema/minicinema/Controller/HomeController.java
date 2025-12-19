package com.cinema.minicinema.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /**
     * Forward root path to static index.html so GET / works in browser.
     */
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    /**
     * Return 204 for favicon requests to avoid NoHandlerFoundException being logged.
     */
    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}

