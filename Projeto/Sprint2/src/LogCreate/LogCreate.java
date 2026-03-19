package LogCreate;

import LogDestination.LogDestination;

public abstract class LogCreate {
    public String log;
    private String logPath = "logs/app.log";
    private String logMessage = "";
    protected LogDestination destination;

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

    public void setDestination(LogDestination destination) {
        this.destination = destination;
    }

    public void writeLog() {
        if (destination == null) {
            System.out.println("Nenhum destino definido para o log.");
            return;
        }

        destination.open();
        destination.write(logMessage);
        destination.close();
    }
}