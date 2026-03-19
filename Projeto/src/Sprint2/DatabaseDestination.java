package Sprint2;

import java.sql.Connection;

public class DatabaseDestination implements LogDestination {
    private Connection conn;

    public DatabaseDestination(Connection conn) {
        this.conn = conn;
    }

    @Override
    public void open() {
        if (conn != null) {
            System.out.println("Ligação à base de dados pronta.");
        } else {
            System.out.println("Ligação à base de dados não disponível.");
        }
    }

    @Override
    public void write(String message) {
        if (conn == null) {
            System.out.println("Não foi possível guardar o log na base de dados.");
            return;
        }

        System.out.println("Log guardado na base de dados: " + message);
    }

    @Override
    public void close() {
        System.out.println("Database destination closed.");
    }
}