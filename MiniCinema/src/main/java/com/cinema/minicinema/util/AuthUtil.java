package com.cinema.minicinema.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

/**
 * Small helper to resolve userId from request. Supports:
 * - explicit userId param as string (handles "undefined")
 * - Authorization header Bearer <token> (NOT implemented to map token->userId because project doesn't persist tokens)
 */
public class AuthUtil {

    public static Long resolveUserId(HttpServletRequest request, String userIdParam) {
        if (StringUtils.hasText(userIdParam)) {
            try {
                // handle frontend sending "undefined"
                if ("undefined".equals(userIdParam)) return null;
                return Long.valueOf(userIdParam);
            } catch (Exception ignored) {
            }
        }

        // Try header
        String auth = request.getHeader("Authorization");
        if (!StringUtils.hasText(auth)) return null;
        String token = auth.startsWith("Bearer ") ? auth.substring(7) : auth;
        // NOTE: token -> userId mapping isn't implemented in this project (tokens are ephemeral). If you persist tokens
        // to Redis or DB, lookup should be implemented here. For now return null so the controller treats as unauthenticated.
        return null;
    }
}

