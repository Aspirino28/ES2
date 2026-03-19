package LogCreate;

public class ErrorFactory extends FactoryLogCreate {
    @Override
    public LogCreate createLogCreate(String log) {
        return new Error();
    }
}
