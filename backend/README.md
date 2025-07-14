# CollabraDoc Backend

This is the FastAPI backend for the CollabraDoc application.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment variables:**
   Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URL=mongodb://localhost:27017
   SECRET_KEY=your-secret-key-here-make-it-long-and-random
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

4. **Run the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Documents
- `GET /api/documents/` - Get all documents for current user
- `POST /api/documents/` - Create a new document
- `GET /api/documents/{id}` - Get a specific document
- `PUT /api/documents/{id}` - Update a document
- `DELETE /api/documents/{id}` - Delete a document

### Folders
- `GET /api/folders/` - Get all folders for current user
- `POST /api/folders/` - Create a new folder
- `GET /api/folders/{id}` - Get a specific folder
- `PUT /api/folders/{id}` - Update a folder
- `DELETE /api/folders/{id}` - Delete a folder

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "string (hashed)",
  "full_name": "string (optional)"
}
```

### Documents Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "folder_id": "ObjectId (optional)",
  "isPublic": "boolean",
  "owner_id": "ObjectId",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Folders Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "parent_id": "ObjectId (optional)",
  "owner_id": "ObjectId",
  "created_at": "datetime",
  "updated_at": "datetime"
}
``` 