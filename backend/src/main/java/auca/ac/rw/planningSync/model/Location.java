package auca.ac.rw.planningSync.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    private ELocation type;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Location parentLocation;

    @OneToMany(mappedBy = "parentLocation")
    @JsonManagedReference
    private List<Location> children = new ArrayList<>();

    @OneToMany(mappedBy = "village")
    @JsonIgnore
    private List<User> users = new ArrayList<>();


    public Location() {
    }

    public Location(UUID id, String name, ELocation type, Location parentLocation, List<Location> children,
            List<User> users) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parentLocation = parentLocation;
        this.children = children;
        this.users = users;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ELocation getType() {
        return type;
    }

    public void setType(ELocation type) {
        this.type = type;
    }

    public Location getParentLocation() {
        return parentLocation;
    }

    public void setParentLocation(Location parentLocation) {
        this.parentLocation = parentLocation;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public List<Location> getChildren() {
        return children;
    }

    public void setChildren(List<Location> children) {
        this.children = children;
    }
    
}
