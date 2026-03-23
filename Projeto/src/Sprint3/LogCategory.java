package Sprint3;

import java.util.ArrayList;
import java.util.List;
import Sprint1.LogCreate.LogCreate;

public class LogCategory implements LogComponent {
    private String name;
    private List<LogComponent> children = new ArrayList<>();

    public LogCategory(String name) {
        this.name = name;
    }

    @Override
    public void add(LogComponent component) {
        children.add(component);
    }

    @Override
    public void remove(LogComponent component) {
        children.remove(component);
    }

    @Override
    public List<LogCreate> getLogs() {
        List<LogCreate> allLogs = new ArrayList<>();
        for (LogComponent child : children) {
            allLogs.addAll(child.getLogs());
        }
        return allLogs;
    }

    @Override
    public String getName() {
        return name;
    }

    public List<LogComponent> getChildren() {
        return children;
    }
}