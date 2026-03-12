package com.es2.decorator;

public class Auth extends Object implements AuthInterface {

    public Auth() {}

    public void auth(String username, String password) throws AuthException {
        // Implementação básica de autenticação
        if (!"admin".equals(username) || !"admin".equals(password)) {
            throw new AuthException("Invalid credentials");
        }
    }
}