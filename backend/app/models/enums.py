from enum import StrEnum


class ChangeType(StrEnum):
    BUG_FIX = "Bug Fix"
    NEW_FEATURE = "New Feature"
    REFACTORING = "Refactoring"
    CONFIGURATION_CHANGE = "Configuration Change"


class RiskLevel(StrEnum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class UserRole(StrEnum):
    DEVELOPER = "developer"
    ADMIN = "admin"
