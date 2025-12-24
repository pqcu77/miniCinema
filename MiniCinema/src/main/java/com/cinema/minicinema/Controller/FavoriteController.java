package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.FavoriteService;
import com.cinema.minicinema.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorite")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final HttpServletRequest request;

    @PostMapping(value = "/add", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> addFavorite(@RequestParam(required = false) String userId,
                                           @RequestParam Integer movieId) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long resolvedUserId = AuthUtil.resolveUserId(request, userId);
            if (resolvedUserId == null) {
                res.put("code", 0);
                res.put("msg", "用户未登录或 userId 无效");
                res.put("data", null);
                return res;
            }

            boolean added = favoriteService.addFavorite(resolvedUserId, movieId);
            res.put("code", added ? 1 : 0);
            res.put("msg", added ? "success" : "already exists");
            res.put("data", null);
            return res;
        } catch (Exception e) {
            res.put("code", 0);
            res.put("msg", "add favorite failed: " + e.getMessage());
            res.put("data", null);
            return res;
        }
    }

    @DeleteMapping(value = "/remove/{movieId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> removeFavorite(@RequestParam(required = false) String userId,
                                              @PathVariable Integer movieId) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long resolvedUserId = AuthUtil.resolveUserId(request, userId);
            if (resolvedUserId == null) {
                res.put("code", 0);
                res.put("msg", "用户未登录或 userId 无效");
                res.put("data", null);
                return res;
            }

            boolean ok = favoriteService.removeFavorite(resolvedUserId, movieId);
            res.put("code", ok ? 1 : 0);
            res.put("msg", ok ? "success" : "not found");
            res.put("data", null);
            return res;
        } catch (Exception e) {
            res.put("code", 0);
            res.put("msg", "remove favorite failed: " + e.getMessage());
            res.put("data", null);
            return res;
        }
    }

    @GetMapping(value = "/list", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> listFavorites(@RequestParam(required = false) String userId) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long resolvedUserId = AuthUtil.resolveUserId(request, userId);
            if (resolvedUserId == null) {
                res.put("code", 1);
                res.put("msg", "success");
                Map<String, Object> data = new HashMap<>();
                data.put("records", java.util.Collections.emptyList());
                data.put("total", 0);
                res.put("data", data);
                return res;
            }

            List<Map<String, Object>> list = favoriteService.listFavorites(resolvedUserId);
            res.put("code", 1);
            res.put("msg", "success");
            Map<String, Object> data = new HashMap<>();
            data.put("records", list);
            data.put("total", list.size());
            res.put("data", data);
            return res;
        } catch (Exception e) {
            res.put("code", 0);
            res.put("msg", "list favorites failed: " + e.getMessage());
            res.put("data", null);
            return res;
        }
    }
}
