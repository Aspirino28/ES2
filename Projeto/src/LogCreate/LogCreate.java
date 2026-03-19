package LogCreate;

public abstract class LogCreate implements InterfaceLog {

    public String log;
    private String logPath    = "logs/app.log";
    private String logMessage = "";

    public abstract String getLog();

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
}