package auca.ac.rw.planningSync.dto;

public class UpdateUserRequest {
    private String password;
    private String villageName;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String password, String villageName) {
        this.password = password;
        this.villageName = villageName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getVillageName() {
        return villageName;
    }

    public void setVillageName(String villageName) {
        this.villageName = villageName;
    }
}
