package Sprint3;

public class MockConnection {
    private static int counter = 0;
    private int id;

    public MockConnection() {
        this.id = ++counter;
        System.out.println("Conexão #" + id + " criada.");
    }

    public void execute(String sql) {
        System.out.println("Conexão #" + id + " executando: " + sql);
    }

    public void close() {
        System.out.println("Conexão #" + id + " fechada.");
    }

    public int getId() {
        return id;
    }
}