package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.TicketMapper;
import com.cinema.minicinema.Service.TicketService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.dto.TicketDTO;
import com.cinema.minicinema.entity.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {
    @Autowired
    private TicketMapper ticketMapper;
    
    @Override
    public List<TicketDTO> getUserTickets(Long userId) {
        List<Ticket> tickets = ticketMapper.selectByUserId(userId);
        return tickets.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void verifyTicket(String ticketCode) {
        Ticket ticket = ticketMapper.selectByTicketCode(ticketCode);
        if (ticket == null) {
            throw new BusinessException("票务不存在");
        }
        
        if (ticket.getStatus() == 1) {
            throw new BusinessException("该票已经核销");
        }
        
        ticketMapper.verify(ticket.getId(), System.currentTimeMillis());
    }
    
    @Override
    public TicketDTO getTicketDetail(String ticketCode) {
        Ticket ticket = ticketMapper.selectByTicketCode(ticketCode);
        if (ticket == null) {
            throw new BusinessException("票务不存在");
        }
        
        return convertToDTO(ticket);
    }
    
    private TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setTicketId(ticket.getId());
        dto.setTicketCode(ticket.getTicketCode());
        dto.setMovieName(ticket.getMovieName());
        dto.setCinemaName(ticket.getCinemaName());
        dto.setHallName(ticket.getHallName());
        dto.setSeatNumber(ticket.getSeatNumber());
        dto.setShowTime(ticket.getShowTime());
        dto.setStatus(ticket.getStatus());
        dto.setStatusText(ticket.getStatus() == 0 ? "已出票" : "已核销");
        dto.setCreatedAt(ticket.getCreatedAt());
        return dto;
    }
}