package LogCreate;

public class Error extends LogCreate {
    public Error() {
        this.log = "ERROR";
    }

    @Override
    public String getLog() {
        return this.log;
    }
}
