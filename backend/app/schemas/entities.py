"""
Entity and relationship schemas for graph-based analysis.
"""

from typing import Any, Literal

from pydantic import BaseModel, Field


class Entity(BaseModel):
    """
    Represents an entity in the knowledge graph.

    Entities can be people, companies, accounts, devices, etc.
    """

    id: str
    entity_type: Literal["person", "company", "vendor", "account", "device", "address", "other"]
    name: str
    aliases: list[str] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0  # Confidence in entity resolution
    source_refs: list[str] = Field(default_factory=list)  # Source case/document IDs
    created_at: str | None = None
    updated_at: str | None = None


class Relationship(BaseModel):
    """
    Represents a relationship between two entities.
    """

    id: str
    source_entity_id: str
    target_entity_id: str
    relationship_type: Literal[
        "owns",
        "employs",
        "employed_by",
        "related_to",
        "transacted_with",
        "approved_by",
        "shares_address",
        "shares_account",
        "shares_device",
        "vendor_of",
        "customer_of",
        "other",
    ]
    attributes: dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0
    strength: float = 1.0  # Relationship strength (e.g., transaction volume)
    first_seen: str | None = None
    last_seen: str | None = None
    source_refs: list[str] = Field(default_factory=list)


class EntityResolutionMatch(BaseModel):
    """
    Represents a potential entity match during resolution.
    """

    entity_a_id: str
    entity_b_id: str
    match_score: float  # 0-1
    match_reasons: list[str] = Field(default_factory=list)
    status: Literal["pending", "confirmed", "rejected"] = "pending"
    resolved_by: str | None = None
    resolved_at: str | None = None


class GraphCluster(BaseModel):
    """
    Represents a cluster of related entities.

    Clusters can indicate:
    - Related parties that should be disclosed
    - Potential collusion networks
    - Vendor rings
    """

    id: str
    entity_ids: list[str]
    cluster_type: Literal["vendor_ring", "related_parties", "transaction_network", "shared_identifiers", "other"]
    risk_score: float = 0.0
    description: str = ""
    key_relationships: list[str] = Field(default_factory=list)
    detected_at: str | None = None


class GraphAnalysisResult(BaseModel):
    """
    Result of graph-based analysis.
    """

    entities_analyzed: int
    relationships_analyzed: int
    clusters_found: list[GraphCluster] = Field(default_factory=list)
    suspicious_patterns: list[dict[str, Any]] = Field(default_factory=list)
    centrality_scores: dict[str, float] = Field(default_factory=dict)  # Entity ID -> centrality
    risk_contribution: float = 0.0
    explanation: str = ""


class VendorProfile(BaseModel):
    """
    Aggregated vendor profile for risk assessment.
    """

    vendor_id: str
    name: str
    aliases: list[str] = Field(default_factory=list)
    total_transactions: int = 0
    total_amount: float = 0.0
    avg_transaction_size: float = 0.0
    first_transaction: str | None = None
    last_transaction: str | None = None
    related_entities: list[str] = Field(default_factory=list)
    risk_signals: list[str] = Field(default_factory=list)
    risk_score: float = 0.0
    cases_involved: list[str] = Field(default_factory=list)


class TransactionSummary(BaseModel):
    """
    Summary of a transaction for analysis.
    """

    id: str
    amount: float
    currency: str = "USD"
    date: str
    description: str = ""
    vendor_id: str | None = None
    vendor_name: str | None = None
    category: str | None = None
    approval_level: int | None = None
    approved_by: str | None = None
    case_id: str | None = None
    signals: list[str] = Field(default_factory=list)
