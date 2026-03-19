package LogDestination;

public interface LogDestination {
    void open();
    void write(String message);
    void close();
}