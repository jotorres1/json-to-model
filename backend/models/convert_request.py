"""
json-to-model
Author: Jorge Torres
Description: Pydantic model for incoming convert request payload.
"""

from pydantic import BaseModel
from typing import Any

class ConvertRequest(BaseModel):
    json: Any  # Parsed input JSON object
    target: str  # Desired output format (e.g., 'pydantic' or 'typescript')