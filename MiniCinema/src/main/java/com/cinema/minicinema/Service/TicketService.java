package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.TicketDTO;
import java.util.List;

public interface TicketService {
    
    /**
     * 支付成功后生成电子票
     */
    void generateTickets(Long orderId);
    
    /**
     * 获取用户的所有票
     */
    List<TicketDTO> getUserTickets(Long userId);
    
    /**
     * 获取票详情
     */
    TicketDTO getTicketDetail(String ticketCode);
    
    /**
     * 核销票（进场时验证）
     */
    void verifyTicket(String ticketCode);
}