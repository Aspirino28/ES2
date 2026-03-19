import LogCreate.LogFactory;
import LogCreate.InterfaceLog;

public class Main {
    public static void main(String[] args) {
        InterfaceLog infoLog = LogFactory.createLog("INFO");
        infoLog.setLogMessage("Esta é uma mensagem de informação.");
        infoLog.setLogPath("logs/info.log");

        InterfaceLog errorLog = LogFactory.createLog("ERROR");
        errorLog.setLogMessage("Esta é uma mensagem de erro.");
        errorLog.setLogPath("logs/error.log");

        System.out.println("--- Log INFO ---");
        System.out.println("Mensagem: " + infoLog.getLogMessage());
        System.out.println("Nível: " + infoLog.getLog());
        System.out.println("Caminho: " + infoLog.getLogPath());

        System.out.println("\n--- Log ERROR ---");
        System.out.println("Mensagem: " + errorLog.getLogMessage());
        System.out.println("Nível: " + errorLog.getLog());
        System.out.println("Caminho: " + errorLog.getLogPath());
    }
}
