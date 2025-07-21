"""
json-to-model
Author: Jorge Torres
Description: Converter class for transforming JSON into code models.
"""

from utils.type_inference import infer_type

class Converter:
    """
    Core service that converts JSON data into Pydantic or TypeScript model definitions.
    """

    def convert(self, data: dict, target: str) -> dict:
        if not isinstance(data, dict):
            return {"error": "Input JSON must be an object"}

        if target == "pydantic":
            return {"generatedCode": self._to_pydantic(data)}
        elif target == "typescript":
            return {"generatedCode": self._to_typescript(data)}
        else:
            return {"error": "Unsupported target format"}

    def _to_pydantic(self, data: dict) -> str:
        """
        Generate a Pydantic model class from the given JSON data.
        """
        lines = ["from pydantic import BaseModel", "", "class Model(BaseModel):"]
        for key, value in data.items():
            lines.append(f"    {key}: {infer_type(value, python=True)}")
        return "\n".join(lines)

    def _to_typescript(self, data: dict) -> str:
        """
        Generate a TypeScript interface from the given JSON data.
        """
        lines = ["interface Model {"]
        for key, value in data.items():
            lines.append(f"  {key}: {infer_type(value, python=False)};")
        lines.append("}")
        return "\n".join(lines)