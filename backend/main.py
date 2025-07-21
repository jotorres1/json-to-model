# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class ConvertRequest(BaseModel):
    json: Any
    target: str

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/convert")
def convert_stub(data: ConvertRequest):
    # Simulate real response
    if data.target == "pydantic":
        return {
            "generatedCode": "class MyModel(BaseModel):\n    field: str"
        }
    elif data.target == "typescript":
        return {
            "generatedCode": "interface MyModel {\n    field: string;\n}"
        }
    else:
        return {
            "error": "Invalid target format"
        }