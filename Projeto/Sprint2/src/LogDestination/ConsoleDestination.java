package LogDestination;

import java.io.PrintStream;

public class ConsoleDestination implements LogDestination {
    private PrintStream stream;

    public ConsoleDestination() {
        this.stream = System.out;
    }

    @Override
    public void open() {
        System.out.println("Console destination opened.");
    }

    @Override
    public void write(String message) {
        stream.println(message);
    }

    @Override
    public void close() {
        System.out.println("Console destination closed.");
    }
}