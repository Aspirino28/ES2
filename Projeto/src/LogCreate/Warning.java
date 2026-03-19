package LogCreate;

public class Warning extends LogCreate {
    public Warning() {
        this.log = "WARNING";
    }

    @Override
    public String getLog() {
        return this.log;
    }
}
