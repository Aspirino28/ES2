package com.es2.decorator;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class CommonWordsValidator extends Decorator {

    public CommonWordsValidator(AuthInterface auth) {
        super(auth);
    }

    @Override
    public void auth(String username, String password) throws AuthException, IOException {
        try {
            String dicWord = getHTTPRequest(password);
        } catch (IOException e) {
            throw new AuthException();
        }

        super.auth(username, password);
    }

    public String getHTTPRequest(String word) throws IOException {
        StringBuilder result = new StringBuilder();

        URL url = new URL("https://owlbot.info/api/v2/dictionary/" + word + "?format=json");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestProperty(
                "User-Agent",
                "Mozilla/5.0"
        );
        conn.setRequestMethod("GET");

        BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line;

        while ((line = rd.readLine()) != null) {
            result.append(line);
        }

        rd.close();
        return result.toString();
    }
}