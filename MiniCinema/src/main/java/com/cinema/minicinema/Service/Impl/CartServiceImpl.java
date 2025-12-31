package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.CartMapper;
import com.cinema.minicinema.Mapper.ScreeningMapper;
import com.cinema.minicinema.Mapper.MovieMapper;
import com.cinema.minicinema.Mapper.CinemaMapper;
import com.cinema.minicinema.Mapper.HallMapper;
import com.cinema.minicinema.Service.CartService;
import com.cinema.minicinema.dto.CartDTO;
import com.cinema.minicinema.dto.CartItemDTO;
import com.cinema.minicinema.dto.ScreeningDetailDTO;
import com.cinema.minicinema.entity.Cart;
import com.cinema.minicinema.entity.Screening;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.entity.Cinema;
import com.cinema.minicinema.entity.Hall;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartMapper cartMapper;
    
    @Autowired
    private ScreeningMapper screeningMapper;
    
    @Autowired
    private MovieMapper movieMapper;
    
    @Autowired
    private CinemaMapper cinemaMapper;
    
    @Autowired
    private HallMapper hallMapper;
    
    @Override
    public CartDTO getCart(Long userId) {
        List<Cart> cartItems = cartMapper.selectByUserId(userId);
        
        CartDTO cartDTO = new CartDTO();
        cartDTO.setUserId(userId);
        cartDTO.setTotalItems(cartItems.size());
        
        List<CartItemDTO> items = cartItems.stream().map(cart -> {
            CartItemDTO item = new CartItemDTO();
            item.setCartId(cart.getId());
            item.setScreeningId(cart.getScreeningId());
            
            // ✅ 从 cart 中获取冗余存储的信息
            item.setMovieName(cart.getMovieName());
            item.setMoviePoster(cart.getMoviePoster());  // ✅ 添加这行
            item.setCinemaName(cart.getCinemaName());    // ✅ 添加这行
            item.setHallName(cart.getHallName());        // ✅ 添加这行
            item.setShowTime(cart.getShowTime() == null ? null : cart.getShowTime().toString());
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
    
/*     @Override
    @Transactional
    public void addToCart(Long userId, Long screeningId, String seatNumbers, Integer quantity) {
        log.info("添加到购物车: userId={}, screeningId={}, seatNumbers={}, quantity={}", 
                userId, screeningId, seatNumbers, quantity);
        
        // ✅ 查询场次信息
        ScreeningDetailDTO screeningDetail = screeningMapper.selectDetailById(screeningId.intValue());
        if (screeningDetail == null) {
            throw new RuntimeException("场次不存在");
        }
        
        // ✅ 查询电影信息
        Movie movie = movieMapper.selectById(screeningDetail.getMovieId().longValue());
        
        // ✅ 查询影院信息
        Cinema cinema = cinemaMapper.selectById((int) screeningDetail.getCinemaId().longValue());
        
        // ✅ 查询影厅信息
        Hall hall = hallMapper.selectById((int) screeningDetail.getHallId().longValue());
        
        // 创建购物车项
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setScreeningId(screeningId);
        cart.setSeatNumbers(seatNumbers);
        cart.setQuantity(quantity);
        
        // ✅ 补全电影信息
        if (movie != null) {
            cart.setMovieName(movie.getTitle());
            cart.setMoviePoster(movie.getPosterUrl());
        }
        
        // ✅ 补全影院信息
        if (cinema != null) {
            cart.setCinemaName(cinema.getName());
        }
        
        // ✅ 补全影厅信息
        if (hall != null) {
            cart.setHallName(hall.getName());
        }
        
        // ✅ 补全场次信息
        cart.setShowTime(screeningDetail.getScreenTime());
        cart.setPrice(screeningDetail.getPrice());
        
        // 计算总价
        BigDecimal totalPrice = screeningDetail.getPrice().multiply(new BigDecimal(quantity));
        cart.setTotalPrice(totalPrice);
        
        // ✅ 使用 createdAt / updatedAt（与数据库字段名一致）
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());
        
        // 保存到数据库
        cartMapper.insert(cart);
        
        log.info("购物车添加成功: movieName={}, seatNumbers={}", cart.getMovieName(), seatNumbers);
    } */

    @Override
    @Transactional
    public void addToCart(Long userId, Long screeningId, String seatNumbers, Integer quantity) {
        log.info("📥 添加到购物车: userId={}, screeningId={}, seatNumbers={}, quantity={}", 
                userId, screeningId, seatNumbers, quantity);
        
        // ✅ 查询场次详情
        ScreeningDetailDTO screeningDetail = screeningMapper.selectDetailById(screeningId.intValue());
        if (screeningDetail == null) {
            log.error("❌ 场次不存在: screeningId={}", screeningId);
            throw new RuntimeException("场次不存在");
        }
        
        log.info("✅ 场次信息: screeningId={}, movieId={}, cinemaId={}, hallId={}, hallName={}, price={}", 
            screeningDetail.getScreeningId(), 
            screeningDetail.getMovieId(), 
            screeningDetail.getCinemaId(), 
            screeningDetail.getHallId(),
            screeningDetail.getHallName(),  // ✅ 直接从 DTO 获取
            screeningDetail.getPrice());
        
        // ✅ 创建购物车项
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setScreeningId(screeningId);
        cart.setSeatNumbers(seatNumbers);
        cart.setQuantity(quantity);
        
        // ✅ 直接从 ScreeningDetailDTO 获取所有信息（无需再次查询数据库）
        cart.setMovieName(screeningDetail.getMovieTitle());  // ✅ movieTitle
        cart.setMoviePoster(screeningDetail.getPosterUrl());  // ✅ posterUrl
        cart.setCinemaName(screeningDetail.getCinemaName());  // ✅ cinemaName
        cart.setHallName(screeningDetail.getHallName());      // ✅ hallName（关键！）
        cart.setShowTime(screeningDetail.getScreenTime());    // ✅ screenTime
        cart.setPrice(screeningDetail.getPrice());
        
        // 计算总价
        BigDecimal totalPrice = screeningDetail.getPrice().multiply(new BigDecimal(quantity));
        cart.setTotalPrice(totalPrice);
        
        // ✅ 时间戳
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());
        
        // ✅ 打印即将保存的购物车对象
        log.info("📤 即将保存购物车: userId={}, movieName={}, hallName={}, cinemaName={}, seatNumbers={}", 
            cart.getUserId(),
            cart.getMovieName(), 
            cart.getHallName(), 
            cart.getCinemaName(),
            cart.getSeatNumbers());
        
        // 保存到数据库
        int result = cartMapper.insert(cart);
        
        if (result > 0) {
            log.info("✅ 购物车保存成功: id={}, hallName={}", cart.getId(), cart.getHallName());
            
            // ✅ 验证：重新查询刚保存的数据
            Cart savedCart = cartMapper.selectById(cart.getId());
            if (savedCart != null) {
                log.info("🔍 验证保存结果: id={}, hallName=[{}]", savedCart.getId(), savedCart.getHallName());
            }
        } else {
            log.error("❌ 购物车保存失败");
            throw new RuntimeException("添加购物车失败");
        }
    }


    @Override
    public void updateCartItem(Long cartId, String seatNumbers, Integer quantity) {
        Cart cart = cartMapper.selectById(cartId);
        if (cart != null) {
            cart.setSeatNumbers(seatNumbers);
            cart.setQuantity(quantity);
            cart.setTotalPrice(cart.getPrice().multiply(BigDecimal.valueOf(quantity)));
            cart.setUpdatedAt(LocalDateTime.now());  // ✅ 修改时间戳
            
            cartMapper.update(cart);
        }
    }
    
    @Override
    public void removeFromCart(Long cartId) {
        cartMapper.delete(cartId);
    }
    
    @Override
    public void clearCart(Long userId) {
        cartMapper.deleteByUserId(userId);
    }
    
/*     @Override
    public void updateCartItem(Long cartId, String seatNumbers, Integer quantity) {
        Cart cart = cartMapper.selectById(cartId);
        if (cart != null) {
            cart.setSeatNumbers(seatNumbers);
            cart.setQuantity(quantity);
            cart.setTotalPrice(cart.getPrice().multiply(BigDecimal.valueOf(quantity)));
            cart.setUpdateTime(LocalDateTime.now());
            
            cartMapper.update(cart);
        }
    } */
}