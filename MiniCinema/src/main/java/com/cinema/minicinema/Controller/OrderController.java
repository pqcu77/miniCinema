package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.OrderService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.OrderDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {
    @Autowired
    private OrderService orderService;
    
    // 创建订单
    @PostMapping("/create")
    public Result createOrder(@RequestParam Long userId) {
        OrderDTO orderDTO = orderService.createOrder(userId);
        return Result.success(orderDTO);
    }
    
    // 获取订单详情
    @GetMapping("/{orderId}")
    public Result getOrderDetail(@PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrderDetail(orderId);
        return Result.success(orderDTO);
    }
    
    // 获取用户订单列表
    @GetMapping("/user/{userId}")
    public Result getUserOrders(@PathVariable Long userId) {
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return Result.success(orders);
    }
    
    // 取消订单
    @PutMapping("/{orderId}/cancel")
    public Result cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return Result.success("取消成功");
    }
}