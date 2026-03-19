package LogConfig;
import LogCreate.LogCreate;

public class LogConfig {
    private static LogConfig istance = new LogConfig();

    private LogConfig() {
    }

    // Esta função vai permitir apenas uma instância poupando memória, e vai impedir multiplas threads a chamar a função
    public static synchronized LogConfig getInstance() {
        if (istance == null) {
            istance = new LogConfig();
        }
        return istance;
    }

    //Mensagem de Logs
    public String log(LogCreate log) {
        return log.getLogMessage();
    }

    //Log Level
    public String logLevel(LogCreate log) {
        return log.getLog();
    }

    //Destino dos Logs
    public String logPath(LogCreate log) {
        return log.getLogPath();
    }
}