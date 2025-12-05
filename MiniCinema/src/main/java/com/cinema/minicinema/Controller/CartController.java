package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.CartService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.CartDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    
    // 获取购物车
    @GetMapping("/{userId}")
    public Result getCart(@PathVariable Long userId) {
        CartDTO cartDTO = cartService.getCart(userId);
        return Result.success(cartDTO);
    }
    
    // 添加到购物车
    @PostMapping("/add")
    public Result addToCart(@RequestParam Long userId, 
                           @RequestParam Long screeningId,
                           @RequestParam String seatNumbers,
                           @RequestParam Integer quantity) {
        cartService.addToCart(userId, screeningId, seatNumbers, quantity);
        return Result.success("添加成功");
    }
    
    // 删除购物车项
    @DeleteMapping("/{cartId}")
    public Result removeFromCart(@PathVariable Long cartId) {
        cartService.removeFromCart(cartId);
        return Result.success("删除成功");
    }
    
    // 清空购物车
    @DeleteMapping("/clear/{userId}")
    public Result clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return Result.success("清空成功");
    }
    
    // 更新购物车项
    @PutMapping("/{cartId}")
    public Result updateCartItem(@PathVariable Long cartId,
                                @RequestParam String seatNumbers,
                                @RequestParam Integer quantity) {
        cartService.updateCartItem(cartId, seatNumbers, quantity);
        return Result.success("更新成功");
    }
}