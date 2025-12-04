package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.*;

public interface UserService {

    UserDTO login(LoginDTO loginDTO);

    UserDTO register(RegisterDTO registerDTO);

    boolean isUsernameAvailable(String username);

    UserDTO getUserById(Integer userId);

    UserDTO updateUser(UpdateUserDTO updateUserDTO);

    void changePassword(ChangePasswordDTO changePasswordDTO);

}