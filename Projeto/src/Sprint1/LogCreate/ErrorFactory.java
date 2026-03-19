package Sprint1.LogCreate;

public class ErrorFactory extends FactoryLogCreate {
    public LogCreate createLogCreate(String log) {
        return new Error();
    }
}

