package Sprint4;

import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;

public interface LogProcessor {
    void process(LogCreate log, LogDestination... destinations);
}