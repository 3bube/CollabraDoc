# Yjs WebSocket Server

A simple WebSocket server for Yjs collaborative editing.

## Features

- Real-time collaborative editing
- User presence tracking
- Document synchronization
- Automatic conflict resolution

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
npm start
```

The server will run on `ws://localhost:1234`

## Integration

The frontend YjsEditor component is already configured to connect to this server. When you open a document, it will automatically connect to the WebSocket server for real-time collaboration.

## Multiple Users

Multiple users can edit the same document simultaneously. The server handles:

- Real-time synchronization of changes
- User presence (who's currently editing)
- Cursor positions
- Conflict resolution

## Development

For development with auto-restart:

```bash
npm run dev
```

## Stopping the Server

Press `Ctrl+C` to stop the server gracefully. 