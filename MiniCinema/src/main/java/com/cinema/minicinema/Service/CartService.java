package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.CartDTO;
import com.cinema.minicinema.dto.CartItemDTO;
import com.cinema.minicinema.entity.Cart;
import java.util.List;

public interface CartService {
    // 获取用户购物车
    CartDTO getCart(Long userId);
    
    // 添加到购物车
    void addToCart(Long userId, Long screeningId, String seatNumbers, Integer quantity);
    
    // 删除购物车项
    void removeFromCart(Long cartId);
    
    // 清空购物车
    void clearCart(Long userId);
    
    // 更新购物车项
    void updateCartItem(Long cartId, String seatNumbers, Integer quantity);
}