package auca.ac.rw.planningSync.model;

public enum ELocation {
    PROVINCE,
    DISTRICT,
    SECTOR,
    CELL,
    VILLAGE;

    public ELocation expectedParent() {
        return switch (this) {
            case DISTRICT -> PROVINCE;
            case SECTOR -> DISTRICT;
            case CELL -> SECTOR;
            case VILLAGE -> CELL;
            case PROVINCE -> null;
        };
    }

    public boolean isValidParent(ELocation parent) {
        return this.expectedParent() == parent;
    }
}
