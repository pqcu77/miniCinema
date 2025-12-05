package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.TicketService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.TicketDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ticket")
public class TicketController {
    @Autowired
    private TicketService ticketService;
    
    // 获取用户的票
    @GetMapping("/user/{userId}")
    public Result getUserTickets(@PathVariable Long userId) {
        List<TicketDTO> tickets = ticketService.getUserTickets(userId);
        return Result.success(tickets);
    }
    
    // 核销票
    @PutMapping("/verify")
    public Result verifyTicket(@RequestParam String ticketCode) {
        ticketService.verifyTicket(ticketCode);
        return Result.success("核销成功");
    }
    
    // 获取票的详细信息
    @GetMapping("/detail")
    public Result getTicketDetail(@RequestParam String ticketCode) {
        TicketDTO ticketDTO = ticketService.getTicketDetail(ticketCode);
        return Result.success(ticketDTO);
    }
}