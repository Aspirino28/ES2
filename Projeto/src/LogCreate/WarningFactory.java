package LogCreate;

public class WarningFactory extends FactoryLogCreate{
    @Override
    public LogCreate createLogCreate(String log) {
        return new Warning();
    }
}
