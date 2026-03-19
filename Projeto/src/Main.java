import Sprint1.LogConfig.LogConfig;
import Sprint1.LogCreate.DebugFactory;
import Sprint1.LogCreate.ErrorFactory;
import Sprint1.LogCreate.FactoryLogCreate;
import Sprint1.LogCreate.InfoFactory;
import Sprint1.LogCreate.LogCreate;
import Sprint1.LogCreate.WarningFactory;
import Sprint2.ConsoleDestination;
import Sprint2.FileDestination;
import Sprint2.LogDestination;
import Sprint2.RemoteDestination;

public class Main {
    public static void main(String[] args) {
        LogConfig config = LogConfig.getInstance();

        LogDestination console = new ConsoleDestination();
        LogDestination file = new FileDestination("logs/app.log");
        LogDestination remote = new RemoteDestination("https://logs.example.local");

        writeLog(config, new InfoFactory(), "Aplicacao iniciada", console, file, remote);
        writeLog(config, new WarningFactory(), "Uso de memoria acima do esperado", console, file);
        writeLog(config, new ErrorFactory(), "Falha ao processar pagamento", console, file, remote);
        writeLog(config, new DebugFactory(), "Detalhes de depuracao da rotina X", console);
    }

    private static void writeLog(
            LogConfig config,
            FactoryLogCreate factory,
            String message,
            LogDestination... destinations
    ) {
        LogCreate log = factory.createLogCreate(message);
        log.setLogMessage(message);

        String formatted = "[" + config.logLevel(log) + "] " + config.log(log);

        for (LogDestination destination : destinations) {
            destination.open();
            destination.write(formatted);
            destination.close();
        }
    }
}