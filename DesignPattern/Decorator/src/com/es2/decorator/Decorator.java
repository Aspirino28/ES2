package com.es2.decorator;

public class Decorator extends Object implements AuthInterface {
    protected AuthInterface auth;

    public Decorator(AuthInterface auth) {
        this.auth = auth;
    }

    public Decorator() {
    }

    public void auth(String username, String password) throws AuthException, java.io.IOException {
        if (auth != null) {
            auth.auth(username, password);
        }
    }
}