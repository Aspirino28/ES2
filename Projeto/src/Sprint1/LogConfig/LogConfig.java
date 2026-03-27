package Sprint1.LogConfig;

import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;
import Sprint4.LogConfigMemento;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class LogConfig {
    private static LogConfig istance = new LogConfig();

    private Set<String> activeLevels;
    private Set<String> activeDestinations;
    private List<String> filters;

    private LogConfig() {
        activeLevels = new LinkedHashSet<>(Arrays.asList("INFO", "WARNING", "ERROR", "DEBUG"));
        activeDestinations = new LinkedHashSet<>(Arrays.asList("Console", "File", "Remote", "Database", "PooledDatabase"));
        filters = new ArrayList<>();
    }

    public static synchronized LogConfig getInstance() {
        if (istance == null) {
            istance = new LogConfig();
        }
        return istance;
    }

    public String log(LogCreate log) {
        return log.getLogMessage();
    }

    public String logLevel(LogCreate log) {
        return log.getLog();
    }

    public String logPath(LogCreate log) {
        return log.getLogPath();
    }

    public void enableLevel(String level) {
        if (level != null) {
            activeLevels.add(level.toUpperCase());
        }
    }

    public void disableLevel(String level) {
        if (level != null) {
            activeLevels.remove(level.toUpperCase());
        }
    }

    public void activateDestination(String destination) {
        if (destination != null) {
            activeDestinations.add(destination);
        }
    }

    public void deactivateDestination(String destination) {
        if (destination != null) {
            activeDestinations.remove(destination);
        }
    }

    public void addFilter(String filter) {
        if (filter != null && !filter.trim().isEmpty()) {
            filters.add(filter.toLowerCase());
        }
    }

    public void removeFilter(String filter) {
        if (filter != null) {
            filters.remove(filter.toLowerCase());
        }
    }

    public void clearFilters() {
        filters.clear();
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

    public boolean isLevelActive(String level) {
        return level != null && activeLevels.contains(level.toUpperCase());
    }

    public boolean isDestinationActive(LogDestination destination) {
        String name = normalizeDestinationName(destination);
        return activeDestinations.contains(name);
    }

    public boolean passesFilters(String message) {
        if (filters.isEmpty()) {
            return true;
        }

        if (message == null) {
            return false;
        }

        String lower = message.toLowerCase();
        for (String filter : filters) {
            if (lower.contains(filter)) {
                return true;
            }
        }
        return false;
    }

    public boolean shouldLog(LogCreate log, LogDestination destination) {
        return isLevelActive(log.getLog())
                && isDestinationActive(destination)
                && passesFilters(log.getLogMessage());
    }

    private String normalizeDestinationName(LogDestination destination) {
        String className = destination.getClass().getSimpleName();

        if (className.endsWith("Destination")) {
            className = className.substring(0, className.length() - "Destination".length());
        }

        return className;
    }

    public LogConfigMemento saveState() {
        return new LogConfigMemento(
                new ArrayList<>(activeLevels),
                new ArrayList<>(activeDestinations),
                new ArrayList<>(filters)
        );
    }

    public void restoreState(LogConfigMemento memento) {
        activeLevels = new LinkedHashSet<>(memento.getActiveLevels());
        activeDestinations = new LinkedHashSet<>(memento.getActiveDestinations());
        filters = new ArrayList<>(memento.getFilters());
    }
}