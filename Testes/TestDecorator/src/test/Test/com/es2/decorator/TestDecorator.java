package com.es2.decorator;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;

public class TestDecorator {

    @Test
    public void testAuthValidCredentials() {
        Auth auth = new Auth();
        assertDoesNotThrow(() -> auth.auth("admin", "admin"));
    }

    @Test
    public void testAuthInvalidCredentials() {
        Auth auth = new Auth();
        assertThrows(AuthException.class, () -> auth.auth("user", "1234"));
    }

    @Test
    public void testCommonWordsValidatorWithoutIOException() {
        AuthInterface baseAuth = new Auth();

        CommonWordsValidator validator = new CommonWordsValidator(baseAuth) {
            @Override
            public String getHTTPRequest(String word) throws IOException {
                return "{\"word\":\"dummy\"}";
            }
        };

        assertDoesNotThrow(() -> validator.auth("admin", "admin"));
    }

    @Test
    public void testCommonWordsValidatorWithIOException() {
        AuthInterface baseAuth = new Auth();

        CommonWordsValidator validator = new CommonWordsValidator(baseAuth) {
            @Override
            public String getHTTPRequest(String word) throws IOException {
                throw new IOException("Erro forçado para teste");
            }
        };

        assertThrows(AuthException.class, () -> validator.auth("admin", "admin"));
    }

    @AfterAll
    public static void tearDownAfterClass() {
        End e = new End();
    }
}