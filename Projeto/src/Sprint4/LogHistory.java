package Sprint4;

import java.util.ArrayList;
import java.util.List;

public class LogHistory {
    private final List<LogConfigMemento> history = new ArrayList<>();

    public void save(LogConfigMemento state) {
        history.add(state);
    }

    public LogConfigMemento getSnapshot(int index) {
        if (index < 0 || index >= history.size()) {
            throw new IllegalArgumentException("Snapshot inválido.");
        }
        return history.get(index);
    }

    public LogConfigMemento undo() {
        if (history.isEmpty()) {
            throw new IllegalStateException("Não existem snapshots guardados.");
        }
        return history.remove(history.size() - 1);
    }
}