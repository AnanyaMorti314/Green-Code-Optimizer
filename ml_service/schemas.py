from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class LanguageEnum(str, Enum):
    python = "python"
    java = "java"
    c = "c"
    cpp = "cpp"

class SeverityEnum(str, Enum):
    critical = "critical"
    warning = "warning"
    info = "info"

class AnalysisRequest(BaseModel):
    filename: str
    language: LanguageEnum
    code: str

class IssueSchema(BaseModel):
    lineStart: int
    lineEnd: int
    severity: SeverityEnum
    type: str
    message: str
    suggestion: str
    co2Impact: float

class AnalysisResponse(BaseModel):
    filename: str
    language: str
    greenScore: float
    co2Estimate: float
    issues: List[IssueSchema]
    metrics: Dict[str, Any]