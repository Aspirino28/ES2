import Sprint1.LogConfig.LogConfig;
import Sprint1.LogCreate.*;
import Sprint2.*;
import Sprint3.*;
import Sprint4.*;

public class Main {
    public static void main(String[] args) {
        LogConfig config = LogConfig.getInstance();
        LogHistory history = new LogHistory();

        LogDestination console = new ConsoleDestination();
        LogDestination file = new FileDestination("logs/app.log");
        LogDestination remote = new RemoteDestination("https://logs.example.local");
        LogDestination db = new PooledDatabaseDestination();

        LogProcessor processor = new BaseLogProcessor();
        processor = new AdminAlertDecorator(processor);
        processor = new MonitoringDecorator(processor);
        processor = new PatternAnalysisDecorator(processor);

        System.out.println("=== ESTADO INICIAL ===");
        history.save(config.saveState());

        writeLog(processor, new InfoFactory(), "Aplicacao iniciada", console, file, remote, db);
        writeLog(processor, new WarningFactory(), "Uso de memoria acima do esperado", console, file, db);
        writeLog(processor, new ErrorFactory(), "Falha ao processar pagamento", console, file, remote, db);
        writeLog(processor, new DebugFactory(), "Detalhes de depuracao da rotina X", console);

        System.out.println("\n=== ALTERAR CONFIGURAÇÃO (M6) ===");
        config.disableLevel("DEBUG");
        config.deactivateDestination("Remote");
        config.addFilter("falha");
        config.addFilter("pagamento");

        writeLog(processor, new InfoFactory(), "Aplicacao iniciada novamente", console, file, remote, db);
        writeLog(processor, new DebugFactory(), "Novo detalhe de depuracao", console, file);
        writeLog(processor, new ErrorFactory(), "Falha ao processar pagamento", console, file, remote, db);
        writeLog(processor, new ErrorFactory(), "Falha ao processar pagamento", console, file, remote, db);

        System.out.println("\n=== RESTAURAR CONFIGURAÇÃO (M6) ===");
        config.restoreState(history.undo());

        writeLog(processor, new DebugFactory(), "Depuracao restaurada com sucesso", console, file, remote);
        writeLog(processor, new InfoFactory(), "Sistema voltou à configuração inicial", console, file, remote, db);

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

        System.out.println("\n=== LOGS DO COMPOSITE ===");
        writeCategoryLogs(processor, sistema, console, file);
        writeCategoryLogs(processor, pagamentos, console, file, remote, db);
        writeCategoryLogs(processor, baseDados, console, file);
        writeCategoryLogs(processor, depuracao, console);

        ConnectionPool.getInstance().closeAll();
    }

    private static void writeLog(LogProcessor processor, FactoryLogCreate factory, String message, LogDestination... destinations) {
        LogCreate log = factory.createLogCreate(message);
        log.setLogMessage(message);
        processor.process(log, destinations);
    }

    private static void writeCategoryLogs(LogProcessor processor, LogComponent category, LogDestination... destinations) {
        for (LogCreate log : category.getLogs()) {
            processor.process(log, destinations);
        }
    }
}