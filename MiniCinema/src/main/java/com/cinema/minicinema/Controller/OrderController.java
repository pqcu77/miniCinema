package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.OrderService;
import com.cinema.minicinema.dto.OrderDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    
    /**
     * 创建订单
     */
    @PostMapping("/create")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> request) {
        log.info("创建订单: {}", request);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = null;
            
            if (request.containsKey("userId")) {
                userId = Long.valueOf(request.get("userId").toString());
            } else {
                response.put("code", 0);
                response.put("msg", "缺少 userId 参数");
                return response;
            }
            
            log.info("userId: {}", userId);
            
            // ✅ 调用服务层创建订单
            OrderDTO orderDTO = orderService.createOrder(userId);
            
            log.info("✅ 订单创建成功: orderId={}", orderDTO.getOrderId());
            
            response.put("code", 1);
            response.put("msg", "订单创建成功");
            response.put("data", orderDTO);
            return response;
        } catch (Exception e) {
            log.error("❌ 创建订单失败:", e);
            
            response.put("code", 0);
            response.put("msg", e.getMessage() != null ? e.getMessage() : "创建订单失败");
            return response;
        }
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/{orderId}")
    public Map<String, Object> getOrderDetail(@PathVariable Long orderId) {
        log.info("获取订单详情: orderId={}", orderId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            OrderDTO orderDTO = orderService.getOrderDetail(orderId);
            
            response.put("code", 1);
            response.put("msg", "查询成功");
            response.put("data", orderDTO);
            return response;
        } catch (Exception e) {
            log.error("❌ 获取订单失败:", e);
            
            response.put("code", 0);
            response.put("msg", e.getMessage());
            return response;
        }
    }
    
    /**
     * 获取用户订单列表
     */
    @GetMapping("/user/{userId}")
    public Map<String, Object> getUserOrders(@PathVariable Long userId) {
        log.info("获取用户订单: userId={}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<OrderDTO> orders = orderService.getUserOrders(userId);
            
            response.put("code", 1);
            response.put("msg", "查询成功");
            response.put("data", orders);
            return response;
        } catch (Exception e) {
            log.error("❌ 获取订单列表失败:", e);
            
            response.put("code", 0);
            response.put("msg", e.getMessage());
            return response;
        }
    }
    
    /**
     * 取消订单
     */
    @PutMapping("/{orderId}/cancel")
    public Map<String, Object> cancelOrder(@PathVariable Long orderId) {
        log.info("取消订单: orderId={}", orderId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            orderService.cancelOrder(orderId);
            
            response.put("code", 1);
            response.put("msg", "取消成功");
            return response;
        } catch (Exception e) {
            log.error("❌ 取消订单失败:", e);
            
            response.put("code", 0);
            response.put("msg", e.getMessage());
            return response;
        }
    }
}