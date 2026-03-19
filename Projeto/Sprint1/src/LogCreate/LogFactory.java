package LogCreate;

public class LogFactory {
    public static InterfaceLog createLog(String type) {
        switch (type.toUpperCase()) {
            case "INFO":
                return new Info();
            case "WARNING":
                return new Warning();
            case "ERROR":
                return new Error();
            case "DEBUG":
                return new Debug();
            default:
                throw new IllegalArgumentException("Tipo de log desconhecido: " + type);
        }
    }
}