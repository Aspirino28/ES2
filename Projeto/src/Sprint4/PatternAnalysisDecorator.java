package Sprint4;

import Sprint1.LogCreate.LogCreate;
import Sprint2.LogDestination;

import java.util.HashMap;
import java.util.Map;

public class PatternAnalysisDecorator extends LogProcessorDecorator {
    private final Map<String, Integer> occurrences = new HashMap<>();

    public PatternAnalysisDecorator(LogProcessor wrappedProcessor) {
        super(wrappedProcessor);
    }

    @Override
    public void process(LogCreate log, LogDestination... destinations) {
        super.process(log, destinations);

        String signature = extractSignature(log.getLogMessage());
        int total = occurrences.getOrDefault(signature, 0) + 1;
        occurrences.put(signature, total);

        if (total >= 2) {
            System.out.println("ANÁLISE: padrão recorrente detetado -> \"" + signature + "\" (" + total + " ocorrências)");
        }
    }

    private String extractSignature(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "mensagem vazia";
        }

        String lower = message.toLowerCase();

        if (lower.contains("falha")) return "falha";
        if (lower.contains("erro")) return "erro";
        if (lower.contains("timeout")) return "timeout";
        if (lower.contains("memoria")) return "memoria";
        if (lower.contains("pagamento")) return "pagamento";

        return lower;
    }
}