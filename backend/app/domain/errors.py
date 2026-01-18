"""Domain-level error types."""

class DomainError(Exception):
    """Base class for domain errors."""


class CaseNotFound(DomainError):
    """Raised when a case cannot be found."""


class CaseMissingFile(DomainError):
    """Raised when a case has no associated file."""


class CaseExtractionFailed(DomainError):
    """Raised when text extraction fails."""


class AnalysisJobNotFound(DomainError):
    """Raised when an analysis job cannot be found."""
