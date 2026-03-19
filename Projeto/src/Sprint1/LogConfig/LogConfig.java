package Sprint1.LogConfig;
import Sprint1.LogCreate.LogCreate;

public class LogConfig {
    private static LogConfig istance = new LogConfig();

    private LogConfig() {
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
}

