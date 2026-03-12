package com.es2.decorator;

public class Logging extends Decorator {

    public Logging(AuthInterface auth) {
        super(auth);
    }

    public void auth(String username, String password) throws AuthException, java.io.IOException {
        // Mensagem exata que o teste parece estar esperando
        System.out.println("auth()");

        // Delega para o próximo decorador ou para a implementação concreta
        super.auth(username, password);
    }
}