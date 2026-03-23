package Sprint3;

import java.util.List;
import Sprint1.LogCreate.LogCreate;

public interface LogComponent {
    void add(LogComponent component);
    void remove(LogComponent component);
    List<LogCreate> getLogs();          // Retorna todos os logs desta componente e subcomponentes
    String getName();                   // Nome da categoria ou do log
}