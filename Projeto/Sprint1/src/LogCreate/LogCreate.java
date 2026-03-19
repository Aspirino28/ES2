package LogCreate;

public abstract class LogCreate implements InterfaceLog {
    public String log;
    private String logPath = "logs/app.log";
    private String logMessage = "";

    @Override
    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }

    @Override
    public String getLogMessage() {
        return this.logMessage;
    }

    @Override
    public void setLogPath(String logPath) {
        this.logPath = logPath;
    }

    @Override
    public String getLogPath() {
        return this.logPath;
    }

    @Override
    public abstract String getLog();

    public static LogCreate createLog(String type) {
        switch (type.toLowerCase()) {
            case "console":
                return new ConsoleLog();
            case "file":
                return new FileLog();
            default:
                throw new IllegalArgumentException("Unknown log type: " + type);
        }
    }

    static class ConsoleLog extends LogCreate {
        @Override
        public String getLog() {
            return "Console: " + getLogMessage();
        }
    }

    static class FileLog extends LogCreate {
        @Override
        public String getLog() {
            return "File [" + getLogPath() + "]: " + getLogMessage();
        }
    }
}
