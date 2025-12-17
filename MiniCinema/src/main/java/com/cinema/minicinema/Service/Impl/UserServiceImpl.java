package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.dto.*;
import com.cinema.minicinema.entity.User;
import com.cinema.minicinema.Mapper.UserMapper;
import com.cinema.minicinema.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserDTO login(LoginDTO loginDTO) {
        String username = loginDTO.getUsername();
        String password = loginDTO.getPassword();

        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        String encryptedPassword = DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8));
        if (!encryptedPassword.equals(user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        userMapper.updateLastLoginTime(user.getUserId(), LocalDateTime.now());

        log.info("用户登录成功: {}", username);
        return convertToDTO(user);
    }

    @Override
    @Transactional
    public UserDTO register(RegisterDTO registerDTO) {
        String username = registerDTO.getUsername();
        String password = registerDTO.getPassword();

        if (userMapper.existsByUsername(username) > 0) {
            throw new RuntimeException("用户名已存在");
        }

        User user = User.builder()
                .username(username)
                .password(DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8)))
                .email(registerDTO.getEmail())
                .phone(registerDTO.getPhone())
                .avatarUrl("/avatars/default.png")
                .build();

        if (userMapper.insert(user) > 0) {
            log.info("用户注册成功: {}", username);
            return convertToDTO(user);
        }

        throw new RuntimeException("注册失败");
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        return userMapper.existsByUsername(username) == 0;
    }

    @Override
    public UserDTO getUserById(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return convertToDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UpdateUserDTO updateUserDTO) {
        User user = userMapper.selectById(updateUserDTO.getUserId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 更新可修改的字段
        if (updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().trim().isEmpty()) {
            user.setEmail(updateUserDTO.getEmail());
        }

        if (updateUserDTO.getPhone() != null && !updateUserDTO.getPhone().trim().isEmpty()) {
            user.setPhone(updateUserDTO.getPhone());
        }

        if (updateUserDTO.getAvatarUrl() != null && !updateUserDTO.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(updateUserDTO.getAvatarUrl());
        }

        // 更新用户信息
        int result = userMapper.updateProfile(
                user.getUserId(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl()
        );

        if (result <= 0) {
            throw new RuntimeException("更新用户信息失败");
        }

        log.info("用户信息更新成功: userId={}", updateUserDTO.getUserId());

        // 返回更新后的用户信息
        User updatedUser = userMapper.selectById(updateUserDTO.getUserId());
        return convertToDTO(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        // 1. 验证用户存在
        User user = userMapper.selectById(changePasswordDTO.getUserId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 2. 验证原密码
        String oldPasswordEncrypted = DigestUtils.md5DigestAsHex(
                changePasswordDTO.getOldPassword().getBytes(StandardCharsets.UTF_8));
        if (!oldPasswordEncrypted.equals(user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }

        // 3. 验证新密码和确认密码是否一致
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new RuntimeException("新密码和确认密码不一致");
        }

        // 4. 更新密码
        String newPasswordEncrypted = DigestUtils.md5DigestAsHex(
                changePasswordDTO.getNewPassword().getBytes(StandardCharsets.UTF_8));

        int result = userMapper.updatePassword(changePasswordDTO.getUserId(), newPasswordEncrypted);
        if (result <= 0) {
            throw new RuntimeException("密码修改失败");
        }

        log.info("用户密码修改成功: userId={}", changePasswordDTO.getUserId());
    }
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        
        // 生成简单的 token (用户ID + 时间戳的MD5)
        String tokenSource = user.getUserId() + "_" + System.currentTimeMillis();
        String token = DigestUtils.md5DigestAsHex(tokenSource.getBytes(StandardCharsets.UTF_8));
        dto.setToken(token);
        
        return dto;
    }
}