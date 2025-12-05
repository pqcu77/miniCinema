package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.OrderDTO;
import java.util.List;

public interface OrderService {
    // 创建订单
    OrderDTO createOrder(Long userId);
    
    // 获取订单详情
    OrderDTO getOrderDetail(Long orderId);
    
    // 获取用户订单列表
    List<OrderDTO> getUserOrders(Long userId);
    
    // 取消订单
    void cancelOrder(Long orderId);
}