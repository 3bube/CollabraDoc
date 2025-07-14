const WebSocket = require('ws');
const http = require('http');

const port = 1234;

// Store active documents and their connections
const documents = new Map(); // documentId -> { content, connections }

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Collaborative WebSocket Server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, request) => {
  console.log('New WebSocket connection');
  
  // Extract document ID from URL
  const url = new URL(request.url, `http://${request.headers.host}`);
  const documentId = url.searchParams.get('d') || 'default';
  
  console.log(`Document ID: ${documentId}`);
  
  // Get or create document
  let docInfo = documents.get(documentId);
  if (!docInfo) {
    docInfo = {
      content: '',
      connections: new Set(),
      users: new Map()
    };
    documents.set(documentId, docInfo);
    console.log(`Created new document: ${documentId}`);
  }
  
  // Add this connection to the document
  docInfo.connections.add(ws);
  
  // Send current content to new connection
  ws.send(JSON.stringify({
    type: 'init',
    content: docInfo.content,
    documentId: documentId
  }));
  
  // Broadcast to other connections that a new user joined
  docInfo.connections.forEach(connection => {
    if (connection !== ws && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'user_joined',
        documentId: documentId
      }));
    }
  });
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'update':
          // Update document content
          docInfo.content = data.content;
          
          // Broadcast to other connections
          docInfo.connections.forEach(connection => {
            if (connection !== ws && connection.readyState === WebSocket.OPEN) {
              connection.send(JSON.stringify({
                type: 'update',
                content: data.content,
                documentId: documentId
              }));
            }
          });
          break;
          
        case 'cursor':
          // Broadcast cursor position
          docInfo.connections.forEach(connection => {
            if (connection !== ws && connection.readyState === WebSocket.OPEN) {
              connection.send(JSON.stringify({
                type: 'cursor',
                userId: data.userId,
                position: data.position,
                documentId: documentId
              }));
            }
          });
          break;
          
        case 'presence':
          // Update user presence
          docInfo.users.set(data.userId, {
            name: data.name,
            email: data.email,
            color: data.color
          });
          
          // Broadcast presence to other connections
          docInfo.connections.forEach(connection => {
            if (connection !== ws && connection.readyState === WebSocket.OPEN) {
              connection.send(JSON.stringify({
                type: 'presence',
                users: Array.from(docInfo.users.entries()),
                documentId: documentId
              }));
            }
          });
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    docInfo.connections.delete(ws);
    
    // If no more connections, clean up the document
    if (docInfo.connections.size === 0) {
      documents.delete(documentId);
      console.log(`Removed document: ${documentId}`);
    } else {
      // Broadcast that user left
      docInfo.connections.forEach(connection => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'user_left',
            documentId: documentId
          }));
        }
      });
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    docInfo.connections.delete(ws);
  });
});

server.listen(port, () => {
  console.log(`Simple WebSocket server running on ws://localhost:${port}`);
  console.log('Ready for collaborative editing connections!');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 