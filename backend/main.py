"""
json-to-model
Author: Jorge Torres
Description: Main FastAPI application entry point. Sets up middleware and includes all routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI()

# Setup CORS (allow all for dev; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes from the api/routes module
app.include_router(router)