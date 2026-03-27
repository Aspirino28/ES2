package Sprint4;

import Sprint1.LogConfig.LogConfig;
import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;

public class BaseLogProcessor implements LogProcessor {

    @Override
    public void process(LogCreate log, LogDestination... destinations) {
        LogConfig config = LogConfig.getInstance();
        String formatted = "[" + config.logLevel(log) + "] " + config.log(log);

        for (LogDestination destination : destinations) {
            if (!config.shouldLog(log, destination)) {
                continue;
            }

            destination.open();
            destination.write(formatted);
            destination.close();
        }
    }
}