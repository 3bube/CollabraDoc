from fastapi import FastAPI, HTTPException
from routes import api_router
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI(title="CollabraDoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://collabra-doc.vercel.app",
        "https://www.collabra-doc.vercel.app",
        "http://collabra-doc.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to CollabraDoc API"}

app.include_router(api_router, prefix="/api", tags=["api"])

@app.get("/documents/")
async def read_documents():
    # Placeholder for document data retrieval logic
    return [{"id": 1, "title": "Document 1"}, {"id": 2, "title": "Document 2"}]


@app.get("/workspace/")
async def read_workspaces():
    # Placeholder for workspace data retrieval logic
    return [{"id": 1, "name": "Workspace 1"}, {"id": 2, "name": "Workspace 2"}]