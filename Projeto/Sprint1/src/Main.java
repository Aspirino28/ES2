import LogConfig.LogConfig;
import LogCreate.DebugFactory;
import LogCreate.ErrorFactory;
import LogCreate.FactoryLogCreate;
import LogCreate.LogCreate;
import LogCreate.InfoFactory;
import LogCreate.WarningFactory;

public class Main {
    private static void testarFactory(String nomeFactory, FactoryLogCreate factory, String mensagem, LogConfig config) {
        LogCreate log = factory.createLogCreate(nomeFactory);
        log.setLogMessage(mensagem);

        System.out.println("Factory: " + nomeFactory);
        System.out.println("  Nivel: " + config.logLevel(log));
        System.out.println("  Mensagem: " + config.log(log));
        System.out.println("  Caminho: " + config.logPath(log));
        System.out.println();
    }

    public static void main(String[] args) {
        LogConfig config = LogConfig.getInstance();
        System.out.println("Teste Factory Method - Logs");
        System.out.println();

        testarFactory("InfoFactory", new InfoFactory(), "Aplicacao iniciada com sucesso.", config);
        testarFactory("WarningFactory", new WarningFactory(), "Uso de memoria acima do esperado.", config);
        testarFactory("ErrorFactory", new ErrorFactory(), "Falha ao guardar o ficheiro.", config);
        testarFactory("DebugFactory", new DebugFactory(), "Valor da variavel x = 42", config);
    }
}