package Sprint2;

public class RemoteDestination implements LogDestination {
    private String endpoint;

    public RemoteDestination(String endpoint) {
        this.endpoint = endpoint;
    }

    @Override
    public void open() {
        System.out.println("Ligação ao serviço remoto aberta: " + endpoint);
    }

    @Override
    public void write(String message) {
        System.out.println("Enviado para " + endpoint + ": " + message);
    }

    @Override
    public void close() {
        System.out.println("Ligação ao serviço remoto fechada.");
    }
}