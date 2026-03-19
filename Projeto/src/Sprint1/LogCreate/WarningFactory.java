package Sprint1.LogCreate;

public class WarningFactory extends FactoryLogCreate {
    public LogCreate createLogCreate(String log) {
        return new Warning();
    }
}