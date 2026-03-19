package Sprint1.LogCreate;

public class InfoFactory extends FactoryLogCreate {
    public LogCreate createLogCreate(String log) {
        return new Info();
    }
}