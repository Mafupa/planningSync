package auca.ac.rw.planningSync.dto;

public class SearchResultDTO {
    private String type; // EVENT, HABIT, PAGE
    private String title;
    private String description;
    private String link;

    public SearchResultDTO() {
    }

    public SearchResultDTO(String type, String title, String description, String link) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.link = link;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}
