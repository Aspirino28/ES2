package com.es2.decorator;

import java.io.IOException;
import java.time.LocalDateTime;

public class Logging extends Decorator {

    public Logging(AuthInterface auth) {
        super(auth);
    }

    @Override
    public void auth(String username, String password) throws AuthException, IOException {
        System.out.println(LocalDateTime.now() + ",auth()");
        super.auth(username, password);
    }
}