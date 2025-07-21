"""
json-to-model
Author: Jorge Torres
Description: Utility class for inferring data types from Python values for model generation.
"""

from typing import Any


class TypeInferer:
    """
    Infers the appropriate type for a given value in either Python (Pydantic)
    or TypeScript format.
    """

    @staticmethod
    def infer(value: Any, python: bool = True) -> str:
        if isinstance(value, str):
            return "str" if python else "string"
        elif isinstance(value, bool):
            return "bool" if python else "boolean"
        elif isinstance(value, int):
            return "int" if python else "number"
        elif isinstance(value, float):
            return "float" if python else "number"
        elif isinstance(value, list):
            return TypeInferer._infer_list(value, python)
        elif isinstance(value, dict):
            return "dict[str, Any]" if python else "Record<string, any>"
        else:
            return "Any" if python else "any"

    @staticmethod
    def _infer_list(value: list, python: bool) -> str:
        """
        Infers the type of a list, using its first element as a reference.
        Falls back to generic list[Any]/any[] if list is empty or inconsistent.
        """
        if not value:
            return "list[Any]" if python else "any[]"

        first_type = TypeInferer.infer(value[0], python)

        # Check if all elements are of the same type
        if all(TypeInferer.infer(item, python) == first_type for item in value):
            return f"list[{first_type}]" if python else f"{first_type}[]"

        return "list[Any]" if python else "any[]"