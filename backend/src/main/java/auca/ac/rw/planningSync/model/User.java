package auca.ac.rw.planningSync.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserInfo userInfo;

    @ManyToOne
    @JoinColumn(name = "village_id", nullable = false)
    private Location village;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Habit> habits = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "user_events",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    @JsonManagedReference
    private Set<Event> events = new HashSet<>();


    public User() {
    }


    public User(UUID id, String username, String password, String role, Location village) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.village = village;
    }


    public UUID getId() {
        return id;
    }


    public void setId(UUID id) {
        this.id = id;
    }


    public String getUsername() {
        return username;
    }


    public void setUsername(String username) {
        this.username = username;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }


    public String getRole() {
        return role;
    }


    public void setRole(String role) {
        this.role = role;
    }


    public UserInfo getUserInfo() {
        return userInfo;
    }


    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
        userInfo.setUser(this);
    }

    public Location getVillage() {
        return village;
    }

    public void setVillage(Location village) {
        this.village = village;
    }


    public List<Habit> getHabits() {
        return habits;
    }


    public void setHabits(List<Habit> habits) {
        this.habits = habits;
    }


    public Set<Event> getEvents() {
        return events;
    }


    public void setEvents(Set<Event> events) {
        this.events = events;
    }

}