package LogCreate;

public class InfoFactory extends FactoryLogCreate {
    @Override
    public LogCreate createLogCreate(String log) {
        return new Info();
    }
}
