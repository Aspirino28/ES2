package Sprint4;

import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;

public class MonitoringDecorator extends LogProcessorDecorator {

    public MonitoringDecorator(LogProcessor wrappedProcessor) {
        super(wrappedProcessor);
    }

    @Override
    public void process(LogCreate log, LogDestination... destinations) {
        super.process(log, destinations);
        System.out.println("MONITORIZAÇÃO: evento enviado para o sistema externo -> " + log.getLog());
    }
}