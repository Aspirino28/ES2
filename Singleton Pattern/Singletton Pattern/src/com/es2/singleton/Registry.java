package com.es2.singleton;

public class Registry {

    private static Registry instancia;
    private String path;
    private String connectionString;

    private Registry() {}

    public String getConnectionString() {
        return connectionString;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setConnectionString(String connectionString) {
        this.connectionString = connectionString;
    }

    public static Registry getInstance() {
        if (instancia == null) {
            instancia = new Registry();
        }
        return instancia;
    }
}