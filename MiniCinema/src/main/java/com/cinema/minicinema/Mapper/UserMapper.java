package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
    // 只使用注解，不继承任何基类

    @Select("SELECT * FROM users WHERE username = #{username} AND deleted = 0")
    User selectByUsername(String username);

    @Select("SELECT COUNT(*) FROM users WHERE username = #{username} AND deleted = 0")
    int existsByUsername(String username);

    @Select("SELECT COUNT(*) FROM users WHERE email = #{email} AND deleted = 0")
    int existsByEmail(String email);

    @Select("SELECT COUNT(*) FROM users WHERE phone = #{phone} AND deleted = 0")
    int existsByPhone(String phone);

    @Insert("INSERT INTO users (username, password, email, phone, avatar_url) " +
            "VALUES (#{username}, #{password}, #{email}, #{phone}, #{avatarUrl})")
    @Options(useGeneratedKeys = true, keyProperty = "userId")
    int insert(User user);

    @Update("UPDATE users SET last_login_time = #{lastLoginTime} WHERE user_id = #{userId}")
    int updateLastLoginTime(@Param("userId") Integer userId, @Param("lastLoginTime") java.time.LocalDateTime lastLoginTime);

    @Select("SELECT * FROM users WHERE user_id = #{userId} AND deleted = 0")
    User selectById(Integer userId);

    @Update("UPDATE users SET password = #{password} WHERE user_id = #{userId}")
    int updatePassword(@Param("userId") Integer userId, @Param("password") String password);

    @Update("UPDATE users SET email = #{email}, phone = #{phone}, avatar_url = #{avatarUrl} " +
            "WHERE user_id = #{userId}")
    int updateProfile(@Param("userId") Integer userId,
                      @Param("email") String email,
                      @Param("phone") String phone,
                      @Param("avatarUrl") String avatarUrl);
}