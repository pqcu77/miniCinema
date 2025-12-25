package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.CartMapper;
import com.cinema.minicinema.Mapper.OrderMapper;
import com.cinema.minicinema.Mapper.ScreeningMapper;
import com.cinema.minicinema.Service.OrderService;
import com.cinema.minicinema.dto.OrderDTO;
import com.cinema.minicinema.entity.Cart;
import com.cinema.minicinema.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private CartMapper cartMapper;
    
    @Autowired
    private ScreeningMapper screeningMapper;

    @Override
    @Transactional
    public OrderDTO createOrder(Long userId) {
        // 1. 从购物车获取用户的所有商品
        List<Cart> cartItems = cartMapper.selectByUserId(userId);
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("购物车为空，无法创建订单");
        }

        // 2. 计算订单总额
        BigDecimal totalAmount = cartItems.stream()
            .map(Cart::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. 合并座位信息和数量
        String seatInfo = cartItems.stream()
            .map(Cart::getSeatNumbers)
            .collect(Collectors.joining(","));
        Integer seatCount = cartItems.stream()
            .mapToInt(Cart::getQuantity)
            .sum();

        // 4. 生成订单号（示例：ORD20251216001）
        String orderNumber = "ORD" + System.currentTimeMillis();

        // 5. 创建订单对象
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUserId(userId);
        // 如果购物车中所有项目都来自同一个 screening，可以取第一个
        order.setScreeningId(cartItems.get(0).getScreeningId());
        order.setSeatInfo(seatInfo);
        order.setSeatCount(seatCount);
        order.setTotalAmount(totalAmount);
        order.setStatus("pending"); // 待支付

        // 6. 保存订单到数据库
        orderMapper.insert(order);

        // 7. 清空购物车
        cartMapper.deleteByUserId(userId);

        // 8. 返回订单 DTO
        return convertToDTO(order);
    }

    @Override
    public OrderDTO getOrderDetail(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        return convertToDTO(order);
    }

    @Override
    public List<OrderDTO> getUserOrders(Long userId) {
        List<Order> orders = orderMapper.selectByUserId(userId);
        return orders.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void cancelOrder(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!"pending".equals(order.getStatus())) {
            throw new RuntimeException("只有待支付的订单才能取消");
        }
        orderMapper.cancelOrder(orderId);
    }

    /**
     * 将 Order 实体转换为 OrderDTO
     */
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreateTime(order.getCreateTime());
        dto.setPayTime(order.getPayTime());
        return dto;
    }
}