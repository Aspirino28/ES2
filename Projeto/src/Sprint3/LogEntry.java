package Sprint3;

import Sprint1.LogCreate.LogCreate;
import java.util.ArrayList;
import java.util.List;

public class LogEntry implements LogComponent {
    private LogCreate log;
    private String name;

    public LogEntry(String name, LogCreate log) {
        this.name = name;
        this.log = log;
    }

    @Override
    public void add(LogComponent component) {
        throw new UnsupportedOperationException("LogEntry não pode conter outros componentes");
    }

    @Override
    public void remove(LogComponent component) {
        throw new UnsupportedOperationException("LogEntry não pode conter outros componentes");
    }

    @Override
    public List<LogCreate> getLogs() {
        List<LogCreate> list = new ArrayList<>();
        list.add(log);
        return list;
    }

    @Override
    public String getName() {
        return name;
    }

    public LogCreate getLog() {
        return log;
    }
}
