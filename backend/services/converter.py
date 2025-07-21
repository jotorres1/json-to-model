"""
json-to-model
Author: Jorge Torres
Description: Converter class for transforming JSON into code models.
"""

from typing import Any, Dict
from utils.type_inference import TypeInferer  # Updated import


class Converter:
    """
    Core service that converts JSON data into Pydantic or TypeScript model definitions.
    Supports nested objects and list structures.
    """

    def convert(self, data: dict, target: str) -> dict:
        """
        Main conversion entry point.
        """
        if not isinstance(data, dict):
            return {"error": "Input JSON must be an object"}

        self.model_store = {}

        if target == "pydantic":
            code = self._to_pydantic(data)
        elif target == "typescript":
            code = self._to_typescript(data)
        else:
            return {"error": "Unsupported target format"}

        return {"generatedCode": code}

    def _to_pydantic(self, data: dict, model_name: str = "Model") -> str:
        """
        Recursively builds Pydantic models from nested JSON.
        """
        lines = [f"class {model_name}(BaseModel):"]
        for key, value in data.items():
            field_type = self._get_python_type(value, key)
            lines.append(f"    {key}: {field_type}")

        self.model_store[model_name] = "\n".join(lines)
        return "\n\n".join(self.model_store.values())

    def _get_python_type(self, value: Any, key: str) -> str:
        """
        Infers Python type for Pydantic model fields, handling nested dicts and lists.
        """
        if isinstance(value, dict):
            nested_name = key.capitalize()
            self._to_pydantic(value, nested_name)
            return nested_name
        elif isinstance(value, list):
            if value and isinstance(value[0], dict):
                nested_name = key.capitalize() + "Item"
                self._to_pydantic(value[0], nested_name)
                return f"list[{nested_name}]"
            else:
                return TypeInferer.infer(value, python=True)
        else:
            return TypeInferer.infer(value, python=True)

    def _to_typescript(self, data: dict, model_name: str = "Model") -> str:
        """
        Recursively builds TypeScript interfaces from nested JSON.
        """
        lines = [f"interface {model_name} {{"]
        for key, value in data.items():
            field_type = self._get_ts_type(value, key)
            lines.append(f"  {key}: {field_type};")
        lines.append("}")

        self.model_store[model_name] = "\n".join(lines)
        return "\n\n".join(self.model_store.values())

    def _get_ts_type(self, value: Any, key: str) -> str:
        """
        Infers TypeScript type for interface fields, including nested objects and arrays.
        """
        if isinstance(value, dict):
            nested_name = key.capitalize()
            self._to_typescript(value, nested_name)
            return nested_name
        elif isinstance(value, list):
            if value and isinstance(value[0], dict):
                nested_name = key.capitalize() + "Item"
                self._to_typescript(value[0], nested_name)
                return f"{nested_name}[]"
            else:
                return TypeInferer.infer(value, python=False)
        else:
            return TypeInferer.infer(value, python=False)