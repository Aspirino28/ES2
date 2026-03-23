package Sprint3;
import Sprint2.LogDestination;

public class PooledDatabaseDestination implements LogDestination {
    private MockConnection conn;

    @Override
    public void open() {
        conn = ConnectionPool.getInstance().getConnection();
        if (conn == null) {
            System.out.println("Falha ao obter conexão.");
        }
    }

    @Override
    public void write(String message) {
        if (conn == null) {
            System.out.println("Sem conexão, log não registado: " + message);
            return;
        }
        // Simula inserção na base de dados
        String sql = "INSERT INTO logs (message) VALUES ('" + message.replace("'", "''") + "')";
        conn.execute(sql);
    }

    @Override
    public void close() {
        if (conn != null) {
            ConnectionPool.getInstance().releaseConnection(conn);
            conn = null;
        }
    }
}