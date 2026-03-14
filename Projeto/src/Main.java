import LogConfig.LogConfig;
import LogCreate.LogCreate;
import LogCreate.Info;
import LogCreate.Warning;
import LogCreate.Error;

public class Main {
    public static void main(String[] args) {
        // 1. Aceder à instância única do LogConfig
        LogConfig config = LogConfig.getInstance();

        // 2. Criar instâncias de diferentes tipos de logs
        LogCreate infoLog = new Info();
        infoLog.setLogMessage("Mensagem de informação.");
        infoLog.setLogPath("logs/info.log");

        LogCreate warningLog = new Warning();
        warningLog.setLogMessage("Mensagem de aviso.");
        warningLog.setLogPath("logs/warning.log");

        LogCreate errorLog = new Error();
        errorLog.setLogMessage("Mensagem de erro.");
        errorLog.setLogPath("logs/error.log");

        // 3. Usar o LogConfig para imprimir os detalhes dos logs
        System.out.println("--- Log INFO ---");
        System.out.println("Mensagem: " + config.log(infoLog));
        System.out.println("Nível: " + config.logLevel(infoLog));
        System.out.println("Caminho: " + config.logPath(infoLog));

        System.out.println("\n--- Log WARNING ---");
        System.out.println("Mensagem: " + config.log(warningLog));
        System.out.println("Nível: " + config.logLevel(warningLog));
        System.out.println("Caminho: " + config.logPath(warningLog));

        System.out.println("\n--- Log ERROR ---");
        System.out.println("Mensagem: " + config.log(errorLog));
        System.out.println("Nível: " + config.logLevel(errorLog));
        System.out.println("Caminho: " + config.logPath(errorLog));
    }
}
