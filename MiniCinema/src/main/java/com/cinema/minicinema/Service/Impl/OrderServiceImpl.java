package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.*;
import com.cinema.minicinema.Service.OrderService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.dto.OrderDTO;
import com.cinema.minicinema.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private CartMapper cartMapper;
    
    @Autowired
    private OrderItemMapper orderItemMapper;
    
    @Autowired
    private ScreeningMapper screeningMapper;
    
    @Override
    @Transactional
    public OrderDTO createOrder(Long userId) {
        List<Cart> cartItems = cartMapper.selectByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BusinessException("购物车为空");
        }

        Order order = new Order();
        order.setUserId(userId.intValue());        // Order.userId 是 Integer
        order.setStatus("0");                      // 待支付，字符串
        order.setCreateTime(LocalDateTime.now());
        order.setOrderNumber(generateOrderNumber());
        order.setTotalAmount(cartItems.stream()
                .map(Cart::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        orderMapper.insert(order);
        Integer orderId = order.getOrderId();
        Long orderIdLong = orderId == null ? null : orderId.longValue();

        for (Cart cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(orderIdLong);
            orderItem.setScreeningId(cartItem.getScreeningId() == null ? null : cartItem.getScreeningId().longValue());
            orderItem.setSeatNumbers(cartItem.getSeatNumbers());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setCreatedAt(System.currentTimeMillis());
            orderItemMapper.insert(orderItem);
        }

        cartMapper.deleteByUserId(userId);
        return getOrderDetail(orderIdLong);
    }
    
    @Override
    public OrderDTO getOrderDetail(Long orderId) {
        Order order = orderMapper.selectById(orderId); // 改用 Long
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderId(order.getOrderId() == null ? null : Long.valueOf(order.getOrderId()));
        orderDTO.setUserId(order.getUserId() == null ? null : Long.valueOf(order.getUserId()));
        orderDTO.setStatus(order.getStatus() == null ? null : Integer.parseInt(order.getStatus()));
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setCreatedAt(order.getCreateTime() == null ? null
                : order.getCreateTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        return orderDTO;
    }
    
    @Override
    public List<OrderDTO> getUserOrders(Long userId) {
        List<Order> orders = orderMapper.selectByUserId(userId); // 改用 Long
        return orders.stream()
                .map(o -> getOrderDetail(o.getOrderId() == null ? null : o.getOrderId().longValue()))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderMapper.selectById(orderId); // 改用 Long
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!"0".equals(order.getStatus())) {
            throw new BusinessException("只能取消待支付订单");
        }
        order.setStatus("2"); // 已取消
        orderMapper.update(order);
    }
    
    private String generateOrderNumber() {
        return "ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8);
    }
}