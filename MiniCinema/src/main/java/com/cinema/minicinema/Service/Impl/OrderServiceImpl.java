/* package com.cinema.minicinema.Service.Impl;

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
} */

package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.CartMapper;
import com.cinema.minicinema.Mapper.OrderMapper;
import com.cinema.minicinema.Service.OrderService;
import com.cinema.minicinema.Service.SeatLockService;
import com.cinema.minicinema.Service.TicketService;
import com.cinema.minicinema.dto.OrderDTO;
import com.cinema.minicinema.entity.Cart;
import com.cinema.minicinema.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private CartMapper cartMapper;
    
    @Autowired
    private TicketService ticketService;
    
    // ✅ 新增：注入 SeatLockService
    @Autowired
    private SeatLockService seatLockService;

    @Override
    @Transactional
    public OrderDTO createOrder(Long userId) {
        log.info("📝 创建订单: userId={}", userId);
        
        // 1. 获取用户购物车中的商品
        List<Cart> cartItems = cartMapper.selectByUserId(userId);
        
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("购物车为空，无法创建订单");
        }
        
        log.info("🛒 购物车商品数量: {}", cartItems.size());
        
        // 2. 计算总金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Cart item : cartItems) {
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        log.info("💰 订单总金额: {}", totalAmount);
        
        // 3. 合并座位信息
        String seatInfo = cartItems.stream()
            .map(Cart::getSeatNumbers)
            .collect(Collectors.joining(","));
        Integer seatCount = cartItems.stream()
            .mapToInt(Cart::getQuantity)
            .sum();
        
        // 4. 创建订单
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderNumber(generateOrderNumber());
        order.setScreeningId(cartItems.get(0).getScreeningId().longValue());
        order.setSeatInfo(seatInfo);
        order.setSeatCount(seatCount);
        order.setTotalAmount(totalAmount);
        order.setStatus("paid");
        order.setPayTime(LocalDateTime.now());
        
        orderMapper.insert(order);
        
        log.info("✅ 订单创建成功: orderId={}, orderNumber={}", order.getOrderId(), order.getOrderNumber());
        
        // ✅ 5. 【关键步骤】将座位状态从 LOCKED 更新为 PAID
        try {
            Integer screeningId = order.getScreeningId().intValue();
            Integer userIdInt = userId.intValue();
            Integer orderIdInt = order.getOrderId().intValue();
            
            log.info("🔒 开始更新座位状态为 PAID: userId={}, screeningId={}, orderId={}", 
                userIdInt, screeningId, orderIdInt);
            
            seatLockService.confirmSeats(userIdInt, screeningId, orderIdInt);
            
            log.info("✅ 座位状态已更新为 PAID");
        } catch (Exception e) {
            log.warn("⚠️ 更新座位状态失败（可能座位锁定已过期）: {}", e.getMessage());
            // ✅ 判断是否是座位锁定过期
            if (e.getMessage() != null && e.getMessage().contains("未找到用户的座位锁定记录")) {
                throw new RuntimeException("⏰ 超时未支付，座位已失效，请重新选座");
            }
            
            throw new RuntimeException("⚠️ 座位确认失败: " + e.getMessage());
        }
        
        
        // 6. 生成电子票
        log.info("🎫 开始生成电子票...");
        ticketService.generateTickets(order.getOrderId());
        log.info("✅ 电子票生成完成");
        
        // 7. 清空购物车
        cartMapper.deleteByUserId(userId);
        log.info("🗑️ 购物车已清空");
        
        // 8. 返回订单信息
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderId(order.getOrderId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setUserId(userId);
        orderDTO.setTotalAmount(totalAmount);
        orderDTO.setStatus(order.getStatus());
        orderDTO.setPayTime(order.getPayTime());
        
        return orderDTO;
    }

    private String generateOrderNumber() {
        return "ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
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

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setScreeningId(order.getScreeningId());
        dto.setSeatInfo(order.getSeatInfo());
        dto.setSeatCount(order.getSeatCount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPayTime(order.getPayTime());
        dto.setCreateTime(order.getCreateTime());
        return dto;
    }
}