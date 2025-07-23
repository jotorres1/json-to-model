"""
json-to-model
Author: Jorge Torres
Description: Defines API routes for model conversion.
"""

from fastapi import APIRouter
from models.convert_request import ConvertRequest
from services.converter import Converter

router = APIRouter()

@router.post("/convert")
def convert_handler(payload: ConvertRequest):
    """
    Handles POST requests to /convert.
    Passes JSON and target type to the converter service.
    """
    return Converter().convert(payload.json, payload.target)

    from services.converter import Converter

@app.post("/convert")
def convert(request: ConvertRequest):
    converter = Converter()
    return converter.convert(request.json, request.target)