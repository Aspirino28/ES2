package LogCreate;

public class Debug extends LogCreate {
    public Debug() {
        this.log = "DEBUG";
    }

    @Override
    public String getLog() {
        return this.log;
    }
}