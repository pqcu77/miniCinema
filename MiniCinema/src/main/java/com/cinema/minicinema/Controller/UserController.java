package com.cinema.minicinema.Controller;

import com.cinema.minicinema.dto.*;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.Service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<UserDTO> login(@RequestBody LoginDTO loginDTO) {
        try {
            log.info("用户登录请求: username={}", loginDTO.getUsername());

            // 简单参数验证
            if (loginDTO.getUsername() == null || loginDTO.getUsername().trim().isEmpty()) {
                return Result.error("用户名不能为空");
            }
            if (loginDTO.getPassword() == null || loginDTO.getPassword().trim().isEmpty()) {
                return Result.error("密码不能为空");
            }

            UserDTO userDTO = userService.login(loginDTO);
            log.info("用户登录成功: userId={}", userDTO.getUserId());
            return Result.success(userDTO);
        } catch (Exception e) {
            log.error("用户登录失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<UserDTO> register(@RequestBody RegisterDTO registerDTO) {
        try {
            log.info("用户注册请求: username={}", registerDTO.getUsername());

            // 简单参数验证
            if (registerDTO.getUsername() == null || registerDTO.getUsername().trim().isEmpty()) {
                return Result.error("用户名不能为空");
            }
            if (registerDTO.getPassword() == null || registerDTO.getPassword().trim().isEmpty()) {
                return Result.error("密码不能为空");
            }
            if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
                return Result.error("两次密码输入不一致");
            }

            UserDTO userDTO = userService.register(registerDTO);
            log.info("用户注册成功: userId={}", userDTO.getUserId());
            return Result.success(userDTO);
        } catch (Exception e) {
            log.error("用户注册失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 检查用户名是否可用
     */
    @GetMapping("/checkUsername")
    public Result<Boolean> checkUsername(@RequestParam String username) {
        try {
            boolean available = userService.isUsernameAvailable(username);
            log.info("检查用户名可用性: username={}, available={}", username, available);
            return Result.success(available);
        } catch (Exception e) {
            log.error("检查用户名失败: {}", e.getMessage());
            return Result.error("检查失败");
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{userId}")
    public Result<UserDTO> getUserInfo(@PathVariable Integer userId) {
        try {
            UserDTO userDTO = userService.getUserById(userId);
            return Result.success(userDTO);
        } catch (Exception e) {
            log.error("获取用户信息失败: userId={}, error={}", userId, e.getMessage());
            return Result.error("获取用户信息失败");
        }
    }

    /**
     * 修改密码
     */
    @PutMapping("/changePassword")
    public Result<String> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            userService.changePassword(changePasswordDTO);
            return Result.success("密码修改成功");
        } catch (Exception e) {
            log.error("修改密码失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/update")
    public Result<UserDTO> updateUser(@RequestBody UpdateUserDTO updateUserDTO) {
        try {
            UserDTO userDTO = userService.updateUser(updateUserDTO);
            return Result.success(userDTO);
        } catch (Exception e) {
            log.error("更新用户信息失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}