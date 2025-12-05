package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.TicketDTO;
import java.util.List;

public interface TicketService {
    // 获取用户的票
    List<TicketDTO> getUserTickets(Long userId);
    
    // 核销票
    void verifyTicket(String ticketCode);
    
    // 获取票的详细信息
    TicketDTO getTicketDetail(String ticketCode);
}