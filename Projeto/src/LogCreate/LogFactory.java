package LogCreate;

public class LogFactory {
    private static final String PACKAGE_NAME = "LogCreate.";

    public static InterfaceLog createLog(String type) {
        try {
            String className = PACKAGE_NAME + capitalizeFirstLetter(type.toLowerCase());

            Class<?> clazz = Class.forName(className);

            if (!InterfaceLog.class.isAssignableFrom(clazz)) {
                throw new IllegalArgumentException(
                        "A classe " + className + " não implementa InterfaceLog"
                );
            }

            return (InterfaceLog) clazz.getDeclaredConstructor().newInstance();

        } catch (ClassNotFoundException e) {
            throw new IllegalArgumentException("Tipo de log desconhecido: " + type, e);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar instância de log: " + type, e);
        }
    }

    private static String capitalizeFirstLetter(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}