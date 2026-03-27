package Sprint4;

import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;

public class AdminAlertDecorator extends LogProcessorDecorator {

    public AdminAlertDecorator(LogProcessor wrappedProcessor) {
        super(wrappedProcessor);
    }

    @Override
    public void process(LogCreate log, LogDestination... destinations) {
        super.process(log, destinations);

        if ("ERROR".equalsIgnoreCase(log.getLog())) {
            System.out.println("ALERTA ADMIN: foi detetado um log crítico -> " + log.getLogMessage());
        }
    }
}