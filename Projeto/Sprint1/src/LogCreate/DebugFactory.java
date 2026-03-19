package LogCreate;

public class DebugFactory extends FactoryLogCreate {
    @Override
    public LogCreate createLogCreate(String log) {
        return new Debug();
    }
}

