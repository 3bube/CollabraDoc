# CollabraDoc Frontend

This is the Next.js frontend for the CollabraDoc application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Features

- **Document Management**: Create, edit, and organize documents
- **Folder Organization**: Create folders to organize documents
- **Real-time Collaboration**: (Coming soon)
- **User Authentication**: Secure login and registration
- **Responsive Design**: Works on desktop and mobile

## Components

### Core Components
- `CreateDocumentDialog` - Dialog for creating new documents
- `CreateFolderDialog` - Dialog for creating new folders
- `DashboardClient` - Main dashboard with dialogs
- `HeaderWrapper` - Header with action buttons

### API Integration
- `lib/api.ts` - API service for document and folder operations
- Error handling and loading states
- Authentication token management

## API Endpoints Used

The frontend communicates with the following backend endpoints:

- `POST /api/documents/` - Create document
- `GET /api/documents/` - Get user's documents
- `POST /api/folders/` - Create folder
- `GET /api/folders/` - Get user's folders

## Authentication

The frontend expects JWT tokens to be stored in localStorage or sessionStorage with the key `auth_token`. The API service automatically includes this token in requests.

## Development

- Built with Next.js 14
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui components
- React hooks for state management
