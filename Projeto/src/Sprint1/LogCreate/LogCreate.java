package Sprint1.LogCreate;

public abstract class LogCreate {
    public String log;
    private String logPath = "logs/app.log";
    private String logMessage = "";

    public void setLog(String log) {
        this.log = log;
    }

    public String getLog() {
        return this.log;
    }

    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }

    public String getLogMessage() {
        return this.logMessage;
    }

    public void setLogPath(String logPath) {
        this.logPath = logPath;
    }

    public String getLogPath() {
        return this.logPath;
    }
}

