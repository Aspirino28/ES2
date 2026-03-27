package Sprint4;

import java.util.ArrayList;
import java.util.List;

public class LogConfigMemento {
    private final List<String> activeLevels;
    private final List<String> activeDestinations;
    private final List<String> filters;

    public LogConfigMemento(List<String> activeLevels, List<String> activeDestinations, List<String> filters) {
        this.activeLevels = new ArrayList<>(activeLevels);
        this.activeDestinations = new ArrayList<>(activeDestinations);
        this.filters = new ArrayList<>(filters);
    }

    public List<String> getActiveLevels() {
        return new ArrayList<>(activeLevels);
    }

    public List<String> getActiveDestinations() {
        return new ArrayList<>(activeDestinations);
    }

    public List<String> getFilters() {
        return new ArrayList<>(filters);
    }
}