package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.OrderMapper;
import com.cinema.minicinema.Mapper.TicketMapper;
import com.cinema.minicinema.Mapper.ScreeningMapper;
import com.cinema.minicinema.Service.TicketService;
import com.cinema.minicinema.dto.TicketDTO;
import com.cinema.minicinema.dto.ScreeningDetailDTO; 
import com.cinema.minicinema.entity.Order;
import com.cinema.minicinema.entity.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {
    @Autowired
    private TicketMapper ticketMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private ScreeningMapper screeningMapper;

    @Override
    @Transactional
    public void generateTickets(Long orderId) {
        // 1. 查询订单
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }

        // 2. 查询场次信息
        if (order.getScreeningId() == null) {
            throw new RuntimeException("订单数据异常：无场次ID");
        }
        ScreeningDetailDTO screeningDetail = screeningMapper.selectDetailById(order.getScreeningId().intValue());
        
        if (screeningDetail == null) {
            throw new RuntimeException("场次不存在");
        }

        // 3. 获取电影、影院、影厅名称
        String movieName = screeningDetail.getMovieTitle() != null ? screeningDetail.getMovieTitle() : "未知电影";
        String cinemaName = screeningDetail.getCinemaName() != null ? screeningDetail.getCinemaName() : "未知影院";
        String hallName = screeningDetail.getHallName() != null ? screeningDetail.getHallName() : "未知影厅";

        // 4. 解析座位信息
        String[] seatNumbers = order.getSeatInfo().split(",");

        // 5. 为每个座位生成一张电子票
        for (String seatNumber : seatNumbers) {
            Ticket ticket = new Ticket();
            ticket.setOrderId(order.getOrderId());
            ticket.setScreeningId(screeningDetail.getScreeningId());
            ticket.setSeatNumber(seatNumber.trim());
            ticket.setTicketCode("TK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8));
            ticket.setMovieName(movieName);
            ticket.setCinemaName(cinemaName);
            ticket.setHallName(hallName);
            ticket.setShowTime(screeningDetail.getScreenTime());
            ticket.setStatus(0);

            ticketMapper.insert(ticket);
        }
    }

    @Override
    public List<TicketDTO> getUserTickets(Long userId) {
        List<Ticket> tickets = ticketMapper.selectByUserId(userId);
        return tickets.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public TicketDTO getTicketDetail(String ticketCode) {
        Ticket ticket = ticketMapper.selectByTicketCode(ticketCode);
        if (ticket == null) {
            throw new RuntimeException("票据不存在");
        }
        return convertToDTO(ticket);
    }

    @Override
    @Transactional
    public void verifyTicket(String ticketCode) {
        Ticket ticket = ticketMapper.selectByTicketCode(ticketCode);
        if (ticket == null) {
            throw new RuntimeException("票据不存在");
        }
        
        if (ticket.getStatus() == 1) {
            throw new RuntimeException("该票已被核销");
        }
        
        ticketMapper.verifyTicket(ticket.getTicketId());
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setTicketId(ticket.getTicketId());
        dto.setTicketCode(ticket.getTicketCode());
        dto.setOrderId(ticket.getOrderId());
        dto.setMovieName(ticket.getMovieName());
        dto.setCinemaName(ticket.getCinemaName());
        dto.setHallName(ticket.getHallName());
        dto.setSeatNumber(ticket.getSeatNumber());
        dto.setShowTime(ticket.getShowTime() != null ? ticket.getShowTime().toString() : "");
        dto.setStatus(ticket.getStatus());
        dto.setStatusText(ticket.getStatus() == 0 ? "已出票" : "已核销");
        dto.setCreatedAt(ticket.getCreatedAt());
        return dto;
    }
}