import LogConfig.LogConfig;
import LogCreate.LogCreate;
import LogCreate.Info;
import LogCreate.Warning;
import LogCreate.Error;

// IMPORTANTE: novos imports
import LogDestination.ConsoleDestination;
import LogDestination.FileDestination;

public class Main {
    public static void main(String[] args) {

        // 1. Singleton
        LogConfig config = LogConfig.getInstance();

        // 2. Criar logs
        LogCreate infoLog = new Info();
        infoLog.setLogMessage("Mensagem de informação.");
        infoLog.setLogPath("logs/info.log");
        infoLog.setDestination(new ConsoleDestination()); // 👈 novo

        LogCreate warningLog = new Warning();
        warningLog.setLogMessage("Mensagem de aviso.");
        warningLog.setLogPath("logs/warning.log");
        warningLog.setDestination(new FileDestination("logs/warning.log")); // 👈 novo

        LogCreate errorLog = new Error();
        errorLog.setLogMessage("Mensagem de erro.");
        errorLog.setLogPath("logs/error.log");
        errorLog.setDestination(new ConsoleDestination()); // 👈 novo

        // 3. Mostrar (o que já tinhas)
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

        // 🔥 4. ESCREVER OS LOGS (Bridge a funcionar)
        System.out.println("\n--- Escrita dos Logs ---");

        infoLog.writeLog();
        warningLog.writeLog();
        errorLog.writeLog();
    }
}