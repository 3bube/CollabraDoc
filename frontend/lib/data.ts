export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
  accessToken?: string; // for API requests
  status: 'online' | 'away' | 'offline';
  cursor?: {
    x: number;
    y: number;
    selection?: string;
  };
}

export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  author: User;
  collaborators: User[];
  isPublic: boolean;
  tags: string[];
  path: string[];
  version: number;
}

export interface Comment {
  id: string;
  docId: string;
  userId: string;
  content: string;
  position: {
    start: number;
    end: number;
  };
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  members: User[];
  documents: Document[];
  createdAt: Date;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@company.com',
    avatar: '/avatars/alex.jpg',
    role: 'admin',
    status: 'online'
  },
  {
    id: '2',
    name: 'Sarah Kim',
    email: 'sarah@company.com',
    avatar: '/avatars/sarah.jpg',
    role: 'editor',
    status: 'online',
    cursor: { x: 245, y: 120, selection: 'API documentation' }
  },
  {
    id: '3',
    name: 'Marcus Rodriguez',
    email: 'marcus@company.com',
    avatar: '/avatars/marcus.jpg',
    role: 'editor',
    status: 'away'
  },
  {
    id: '4',
    name: 'Emma Thompson',
    email: 'emma@company.com',
    avatar: '/avatars/emma.jpg',
    role: 'viewer',
    status: 'offline'
  }
];

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'API Authentication Guide',
    content: `# API Authentication Guide

## Overview
This document outlines the authentication mechanisms used in our REST API.

## JWT Tokens
We use JSON Web Tokens (JWT) for stateless authentication...

## Implementation
\`\`\`javascript
const token = jwt.sign(payload, process.env.JWT_SECRET);
\`\`\`

## Best Practices
- Always use HTTPS in production
- Implement token rotation
- Set appropriate expiration times`,
    lastModified: new Date('2024-01-15T10:30:00Z'),
    author: mockUsers[0],
    collaborators: [mockUsers[0], mockUsers[1], mockUsers[2]],
    isPublic: false,
    tags: ['api', 'authentication', 'security'],
    path: ['Engineering', 'Backend'],
    version: 3
  },
  {
    id: 'doc-2',
    title: 'React Component Guidelines',
    content: `# React Component Guidelines

## Principles
Our React components should follow these core principles:

1. **Single Responsibility** - Each component should do one thing well
2. **Reusability** - Components should be generic enough to reuse
3. **Testability** - All components should be unit tested

## File Structure
\`\`\`
components/
├── ui/           # Base UI components
├── features/     # Feature-specific components
└── layout/       # Layout components
\`\`\`

## TypeScript Best Practices
Always define proper interfaces for props...`,
    lastModified: new Date('2024-01-14T15:45:00Z'),
    author: mockUsers[1],
    collaborators: [mockUsers[1], mockUsers[0]],
    isPublic: true,
    tags: ['react', 'frontend', 'guidelines'],
    path: ['Engineering', 'Frontend'],
    version: 2
  },
  {
    id: 'doc-3',
    title: 'Database Schema Design',
    content: `# Database Schema Design

## User Tables
Our user management system consists of several interconnected tables...

## Indexing Strategy
Proper indexing is crucial for performance...`,
    lastModified: new Date('2024-01-13T09:20:00Z'),
    author: mockUsers[2],
    collaborators: [mockUsers[2], mockUsers[0]],
    isPublic: false,
    tags: ['database', 'schema', 'backend'],
    path: ['Engineering', 'Database'],
    version: 1
  }
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    docId: 'doc-1',
    userId: '2',
    content: 'Should we also mention rate limiting here?',
    position: { start: 245, end: 267 },
    timestamp: new Date('2024-01-15T11:00:00Z'),
    resolved: false,
    replies: [
      {
        id: 'comment-1-reply-1',
        docId: 'doc-1',
        userId: '1',
        content: 'Good point! I\'ll add a section about it.',
        position: { start: 245, end: 267 },
        timestamp: new Date('2024-01-15T11:15:00Z'),
        resolved: false,
        replies: []
      }
    ]
  }
];

// Mock Workspace
export const mockWorkspace: Workspace = {
  id: 'workspace-1',
  name: 'Engineering Team',
  description: 'Technical documentation and knowledge sharing for the engineering team',
  members: mockUsers,
  documents: mockDocuments,
  createdAt: new Date('2024-01-01T00:00:00Z')
};