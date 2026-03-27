package Sprint4;

import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;

public abstract class LogProcessorDecorator implements LogProcessor {
    protected LogProcessor wrappedProcessor;

    public LogProcessorDecorator(LogProcessor wrappedProcessor) {
        this.wrappedProcessor = wrappedProcessor;
    }

    @Override
    public void process(LogCreate log, LogDestination... destinations) {
        wrappedProcessor.process(log, destinations);
    }
}