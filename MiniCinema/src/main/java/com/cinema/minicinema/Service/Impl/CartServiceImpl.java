package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.CartMapper;
import com.cinema.minicinema.Mapper.ScreeningMapper;
import com.cinema.minicinema.Service.CartService;
import com.cinema.minicinema.dto.CartDTO;
import com.cinema.minicinema.dto.CartItemDTO;
import com.cinema.minicinema.dto.ScreeningDetailDTO;  
import com.cinema.minicinema.entity.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartMapper cartMapper;
    
    @Autowired
    private ScreeningMapper screeningMapper;
    
    @Override
    public CartDTO getCart(Long userId) {
        List<Cart> cartItems = cartMapper.selectByUserId(userId);
        
        CartDTO cartDTO = new CartDTO();
        cartDTO.setUserId(userId);
        cartDTO.setTotalItems(cartItems.size());
        
        List<CartItemDTO> items = cartItems.stream().map(cart -> {
            ScreeningDetailDTO screeningDetail = screeningMapper.selectDetailById(cart.getScreeningId().intValue());
            
            CartItemDTO item = new CartItemDTO();
            item.setCartId(cart.getId());
            item.setScreeningId(cart.getScreeningId());
            if (screeningDetail != null) {
                item.setShowTime(screeningDetail.getScreenTime() == null ? null : screeningDetail.getScreenTime().toString());
            } else {
                item.setShowTime(null);
            }
            item.setMovieName(null);
            item.setSeatNumbers(cart.getSeatNumbers());
            item.setQuantity(cart.getQuantity());
            item.setPrice(cart.getPrice());
            item.setTotalPrice(cart.getTotalPrice());
            return item;
        }).collect(Collectors.toList());
        
        cartDTO.setItems(items);
        cartDTO.setTotalAmount(cartItems.stream()
            .map(Cart::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        return cartDTO;
    }
    
    @Override
    public void addToCart(Long userId, Long screeningId, String seatNumbers, Integer quantity) {
        ScreeningDetailDTO screeningDetail = screeningMapper.selectDetailById(screeningId.intValue());
        
        if (screeningDetail == null) {
            throw new RuntimeException("场次不存在");
        }
        
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setScreeningId(screeningId);
        cart.setSeatNumbers(seatNumbers);
        cart.setQuantity(quantity);
        cart.setPrice(screeningDetail.getPrice());
        cart.setTotalPrice(screeningDetail.getPrice().multiply(BigDecimal.valueOf(quantity)));
        
        cartMapper.insert(cart);
    }
    
    @Override
    public void removeFromCart(Long cartId) {
        cartMapper.delete(cartId);
    }
    
    @Override
    public void clearCart(Long userId) {
        cartMapper.deleteByUserId(userId);
    }
    
    @Override
    public void updateCartItem(Long cartId, String seatNumbers, Integer quantity) {
        Cart cart = cartMapper.selectById(cartId);
        if (cart != null) {
            cart.setSeatNumbers(seatNumbers);
            cart.setQuantity(quantity);
            cart.setTotalPrice(cart.getPrice().multiply(BigDecimal.valueOf(quantity)));
            
            cartMapper.update(cart);
        }
    }
}