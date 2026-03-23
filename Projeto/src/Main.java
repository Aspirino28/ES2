import Sprint1.LogConfig.LogConfig;
import Sprint1.LogCreate.*;
import Sprint2.*;
import Sprint3.*;

public class Main {
    public static void main(String[] args) {
        LogConfig config = LogConfig.getInstance();

        LogDestination console = new ConsoleDestination();
        LogDestination file = new FileDestination("logs/app.log");
        LogDestination remote = new RemoteDestination("https://logs.example.local");
        LogDestination db = new PooledDatabaseDestination();  // M5

        writeLog(config, new InfoFactory(), "Aplicacao iniciada", console, file, remote, db);
        writeLog(config, new WarningFactory(), "Uso de memoria acima do esperado", console, file, db);
        writeLog(config, new ErrorFactory(), "Falha ao processar pagamento", console, file, remote, db);
        writeLog(config, new DebugFactory(), "Detalhes de depuracao da rotina X", console);

        LogCategory sistema = new LogCategory("Sistema");
        LogCategory pagamentos = new LogCategory("Pagamentos");
        LogCategory baseDados = new LogCategory("Base de Dados");
        LogCategory queries = new LogCategory("Queries");
        baseDados.add(queries);
        LogCategory depuracao = new LogCategory("Depuração");

        LogCreate log1 = new InfoFactory().createLogCreate("Aplicacao iniciada");
        log1.setLogMessage("Aplicacao iniciada");
        sistema.add(new LogEntry("Inicialização", log1));

        LogCreate log2 = new WarningFactory().createLogCreate("Uso de memoria acima do esperado");
        log2.setLogMessage("Uso de memoria acima do esperado");
        sistema.add(new LogEntry("Memória", log2));

        LogCreate log3 = new ErrorFactory().createLogCreate("Falha ao processar pagamento");
        log3.setLogMessage("Falha ao processar pagamento");
        pagamentos.add(new LogEntry("Erro", log3));

        LogCreate log4 = new DebugFactory().createLogCreate("Detalhes de depuracao da rotina X");
        log4.setLogMessage("Detalhes de depuracao da rotina X");
        depuracao.add(new LogEntry("Debug", log4));

        LogCreate log5 = new InfoFactory().createLogCreate("Query executada: SELECT * FROM users");
        log5.setLogMessage("Query executada: SELECT * FROM users");
        queries.add(new LogEntry("Query", log5));

        writeCategoryLogs(sistema, console, file);
        writeCategoryLogs(pagamentos, console, file, remote, db);
        writeCategoryLogs(baseDados, console, file);
        writeCategoryLogs(depuracao, console);

        ConnectionPool.getInstance().closeAll();
    }

    private static void writeLog(LogConfig config, FactoryLogCreate factory, String message, LogDestination... destinations) {
        LogCreate log = factory.createLogCreate(message);
        log.setLogMessage(message);
        String formatted = "[" + config.logLevel(log) + "] " + config.log(log);
        for (LogDestination dest : destinations) {
            dest.open();
            dest.write(formatted);
            dest.close();
        }
    }

    private static void writeCategoryLogs(LogComponent category, LogDestination... destinations) {
        for (LogCreate log : category.getLogs()) {
            String formatted = "[" + LogConfig.getInstance().logLevel(log) + "] " + LogConfig.getInstance().log(log);
            for (LogDestination dest : destinations) {
                dest.open();
                dest.write(formatted);
                dest.close();
            }
        }
    }
}