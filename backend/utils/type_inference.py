"""
json-to-model
Author: Jorge Torres
Description: Utility for inferring data types from Python values.
"""

def infer_type(value, python=True) -> str:
    """
    Infers the appropriate type for a given value in either Python (Pydantic)
    or TypeScript format.
    """
    if isinstance(value, str):
        return "str" if python else "string"
    if isinstance(value, bool):
        return "bool" if python else "boolean"
    if isinstance(value, int):
        return "int" if python else "number"
    if isinstance(value, float):
        return "float" if python else "number"
    if isinstance(value, list):
        return "list[Any]" if python else "any[]"
    if isinstance(value, dict):
        return "dict[str, Any]" if python else "Record<string, any>"
    return "Any"