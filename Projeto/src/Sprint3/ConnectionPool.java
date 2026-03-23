package Sprint3;

import java.util.ArrayList;
import java.util.List;

public class ConnectionPool {
    private static ConnectionPool instance = new ConnectionPool();
    private List<MockConnection> available = new ArrayList<>();
    private List<MockConnection> inUse = new ArrayList<>();
    private int maxSize = 2; // pool pequeno para demonstração

    private ConnectionPool() {}

    public static ConnectionPool getInstance() {
        return instance;
    }

    public synchronized MockConnection getConnection() {
        if (!available.isEmpty()) {
            MockConnection conn = available.remove(0);
            inUse.add(conn);
            System.out.println("Conexão #" + conn.getId() + " reutilizada do pool.");
            return conn;
        }
        if (inUse.size() < maxSize) {
            MockConnection conn = new MockConnection();
            inUse.add(conn);
            System.out.println("Conexão #" + conn.getId() + " criada e entregue.");
            return conn;
        }
        System.out.println("Pool esgotado! Nenhuma conexão disponível.");
        return null;
    }

    public synchronized void releaseConnection(MockConnection conn) {
        inUse.remove(conn);
        available.add(conn);
        System.out.println("Conexão #" + conn.getId() + " devolvida ao pool.");
    }

    public synchronized void closeAll() {
        for (MockConnection conn : available) {
            conn.close();
        }
        for (MockConnection conn : inUse) {
            conn.close();
        }
        available.clear();
        inUse.clear();
        System.out.println("Pool fechado.");
    }
}