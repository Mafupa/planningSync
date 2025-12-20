package auca.ac.rw.planningSync.model;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private EHabitRecurrence recurrenceType;

    private LocalTime timeOfDay;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "habit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<HabitLog> logs = new ArrayList<>();

    public Habit() {
    }

    public Habit(UUID id, String name, String description, EHabitRecurrence recurrenceType, LocalTime timeOfDay,
            DayOfWeek dayOfWeek, User user, List<HabitLog> logs) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.recurrenceType = recurrenceType;
        this.timeOfDay = timeOfDay;
        this.dayOfWeek = dayOfWeek;
        this.user = user;
        this.logs = logs;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EHabitRecurrence getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(EHabitRecurrence recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public LocalTime getTimeOfDay() {
        return timeOfDay;
    }

    public void setTimeOfDay(LocalTime timeOfDay) {
        this.timeOfDay = timeOfDay;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<HabitLog> getLogs() {
        return logs;
    }

    public void setLogs(List<HabitLog> logs) {
        this.logs = logs;
    }

    public void addLog(LocalDate date, boolean completed) {
        logs.add(new HabitLog(date, completed, this));
    }

}
