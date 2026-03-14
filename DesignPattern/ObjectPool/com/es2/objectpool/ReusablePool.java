package com.es2.objectpool;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class ReusablePool {

    private static final int DEFAULT_MAX = 10;

    private final URL baseUrl;
    private BlockingQueue<HttpURLConnection> available;
    private final Set<HttpURLConnection> inUse;

    private int maxPoolSize = DEFAULT_MAX;
    private int createdCount = 0;

    private ReusablePool() {
        try {
            this.baseUrl = new URL("https://www.ipv.pt");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        this.available = new ArrayBlockingQueue<>(DEFAULT_MAX);
        this.inUse = new HashSet<>();
    }

    private static final class Holder {
        private static final ReusablePool INSTANCE = new ReusablePool();
    }

    public static ReusablePool getInstance() {
        return Holder.INSTANCE;
    }

    public synchronized HttpURLConnection acquire() throws IOException, PoolExhaustedException {
        HttpURLConnection conn = available.poll();
        if (conn != null) {
            inUse.add(conn);
            return conn;
        }

        if (createdCount < maxPoolSize) {
            HttpURLConnection newConn = (HttpURLConnection) baseUrl.openConnection();
            newConn.setRequestMethod("GET");
            createdCount++;
            inUse.add(newConn);
            return newConn;
        }

        throw new PoolExhaustedException();
    }

    public synchronized void release(HttpURLConnection conn) throws ObjectNotFoundException {
        if (conn == null || !inUse.remove(conn)) {
            throw new ObjectNotFoundException();
        }

        try { conn.disconnect(); } catch (Exception ignored) {}
        available.offer(conn);
    }

    public synchronized void resetPool() {
        // limpa e "reinicia" a pool para estado inicial
        for (HttpURLConnection c : available) {
            try { c.disconnect(); } catch (Exception ignored) {}
        }
        for (HttpURLConnection c : inUse) {
            try { c.disconnect(); } catch (Exception ignored) {}
        }

        available.clear();
        inUse.clear();
        createdCount = 0;
        maxPoolSize = DEFAULT_MAX;
        available = new ArrayBlockingQueue<>(DEFAULT_MAX);
    }

    public synchronized void setMaxPoolSize(int size) {
        this.maxPoolSize = size;
    }
}