# CollabraDoc - Real-Time Collaborative Document Editor

CollabraDoc is a modern, real-time collaborative document editor built with Next.js, FastAPI, and WebSocket technology. It allows multiple users to edit documents simultaneously with live presence indicators and auto-save functionality.

## Features

### ✨ Core Features
- **Real-time Collaborative Editing**: Multiple users can edit documents simultaneously
- **Live User Presence**: See who's currently editing the document
- **Auto-save**: Documents are automatically saved as you type
- **Document Organization**: Create folders to organize your documents
- **Public/Private Documents**: Control document visibility
- **Modern UI**: Clean, responsive interface built with shadcn/ui

### 🔧 Technical Features
- **WebSocket-based Collaboration**: Custom WebSocket server for real-time sync
- **JWT Authentication**: Secure user authentication
- **MongoDB Database**: Scalable document storage
- **TypeScript**: Full type safety across the stack
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
CollabraDoc/
├── backend/                 # FastAPI backend
│   ├── core/               # Core functionality (auth, database, etc.)
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   └── main.py             # FastAPI application
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utilities and API client
│   └── package.json        # Frontend dependencies
└── websocket-server/       # Custom WebSocket server for collaboration
    ├── server.js           # WebSocket server implementation
    └── package.json        # Server dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CollabraDoc
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Set up the WebSocket server**
   ```bash
   cd websocket-server
   npm install
   ```

### Configuration

1. **Backend Environment Variables**
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   JWT_SECRET=your-secret-key
   ```

2. **Frontend Environment Variables**
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

3. **Start the WebSocket server**
   ```bash
   cd websocket-server
   node server.js
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating Documents
1. Click the "Create Document" button in the dashboard
2. Enter a title and optionally select a folder
3. Choose if the document should be public or private
4. Click "Create Document" to start editing

### Collaborative Editing
1. Open a document to start editing
2. Other users can join the same document
3. See real-time presence indicators
4. Changes are automatically synchronized
5. Documents auto-save every 2 seconds

### Managing Folders
1. Click "Create Folder" to organize documents
2. Select a parent folder (optional)
3. Documents can be moved between folders

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token

### Documents
- `GET /documents` - Get all user documents
- `POST /documents` - Create a new document
- `GET /documents/{id}` - Get a specific document
- `PUT /documents/{id}` - Update a document
- `DELETE /documents/{id}` - Delete a document

### Folders
- `GET /folders` - Get all user folders
- `POST /folders` - Create a new folder
- `PUT /folders/{id}` - Update a folder
- `DELETE /folders/{id}` - Delete a folder

## WebSocket Protocol

The WebSocket server handles real-time collaboration with the following message types:

- `init` - Initialize document content
- `update` - Document content updates
- `presence` - User presence information
- `cursor` - Cursor position updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team. 