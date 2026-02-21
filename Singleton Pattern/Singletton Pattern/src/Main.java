import com.es2.singleton.Registry;

public class Main {
    public static void main(String[] args) {

        System.out.println("--- 1. Primeira chamada ao Singleton ---");

        Registry config1 = Registry.getInstance();
        System.out.println("Path inicial: " + config1.getPath());
        System.out.println("BD inicial: " + config1.getConnectionString());

        System.out.println("\n--- 2. Alterar os valores (Módulo A) ---");

        config1.setPath("D:/pasta_do_projeto/ficheiros");
        config1.setConnectionString("jdbc:mysql://servidor_producao:3306/bd_final");
        System.out.println("Novos valores guardados com sucesso!");

        System.out.println("\n--- 3. Segunda chamada ao Singleton (Módulo B) ---");

        Registry config2 = Registry.getInstance();

        System.out.println("Path lida pela config2: " + config2.getPath());
        System.out.println("BD lida pela config2: " + config2.getConnectionString());

        System.out.println("\n--- 4. Prova Final de Arquitetura (Memória) ---");

        if (config1 == config2) {
            System.out.println("SUCESSO! 'config1' e 'config2' apontam para o exato MESMO objeto.");
            System.out.println("O teu Padrão Singleton está perfeito!");
        } else {
            System.out.println("ERRO! Os objetos são diferentes.");
        }
    }
}