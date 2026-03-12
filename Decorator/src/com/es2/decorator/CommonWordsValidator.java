package com.es2.decorator;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class CommonWordsValidator extends Decorator {
    public CommonWordsValidator(AuthInterface auth) {
        super(auth);
    }

    public void auth(String username, String password) throws AuthException, java.io.IOException {
        // Verifica se a password é comum
        if (isCommonPassword(password)) {
            throw new AuthException("Password is too common");
        }

        super.auth(username, password);
    }

    private boolean isCommonPassword(String password) throws java.io.IOException {
        String response = getHTTPRequest(password);
        return "true".equals(response.trim());
    }

    public String getHTTPRequest(String word) throws java.io.IOException {
        // Simulação de chamada a API REST (na prática, seria uma URL real)
        // Para fins de teste, vamos considerar que "password" e "123456" são palavras comuns
        if ("password".equals(word) || "123456".equals(word)) {
            return "true";
        }
        return "false";
    }
}