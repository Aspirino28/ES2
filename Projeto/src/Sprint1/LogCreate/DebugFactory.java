package Sprint1.LogCreate;

public class DebugFactory extends FactoryLogCreate {
    public LogCreate createLogCreate(String log) {
        return new Debug();
    }
}
