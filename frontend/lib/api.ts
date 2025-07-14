const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('token')
    : null;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Network error');
  }
}

// Document API
export interface Document {
  id: string;
  title: string;
  content: string;
  folder_id?: string;
  isPublic: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  title: string;
  folder_id?: string;
  isPublic?: boolean;
  content?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  folder_id?: string;
  isPublic?: boolean;
}

export const documentApi = {
  create: (data: CreateDocumentRequest): Promise<Document> =>
    apiRequest<Document>('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (): Promise<Document[]> =>
    apiRequest<Document[]>('/documents/'),

  search: (q: string): Promise<Document[]> =>
    apiRequest<Document[]>(`/documents/search?q=${encodeURIComponent(q)}`),

  getById: (id: string): Promise<Document> =>
    apiRequest<Document>(`/documents/${id}`),

  update: (id: string, data: UpdateDocumentRequest): Promise<Document> =>
    apiRequest<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

// Folder API
export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderRequest {
  name: string;
  parent_id?: string | null;
}

export interface UpdateFolderRequest {
  name?: string;
  parent_id?: string;
}

export const folderApi = {
  create: (data: CreateFolderRequest): Promise<Folder> =>
    apiRequest<Folder>('/folders/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (): Promise<Folder[]> =>
    apiRequest<Folder[]>('/folders/'),

  getById: (id: string): Promise<Folder> =>
    apiRequest<Folder>(`/folders/${id}`),

  update: (id: string, data: UpdateFolderRequest): Promise<Folder> =>
    apiRequest<Folder>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/folders/${id}`, {
      method: 'DELETE',
    }),
};

// Comment API
export interface TextSelection {
  start: number;
  end: number;
  text: string;
  element_id?: string;
}

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  document_id: string;
  content: string;
  author: CommentAuthor;
  created_at: string;
  updated_at: string;
  replies: Comment[];
  resolved: boolean;
  selection?: TextSelection;
  position?: {
    x: number;
    y: number;
  };
  parent_id?: string;
}

export interface CreateCommentRequest {
  content: string;
  document_id: string;
  parent_id?: string;
  selection?: TextSelection;
  position?: {
    x: number;
    y: number;
  };
}

export interface UpdateCommentRequest {
  content?: string;
  resolved?: boolean;
}

export const commentApi = {
  create: (data: CreateCommentRequest): Promise<Comment> =>
    apiRequest<Comment>('/comments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByDocument: (documentId: string): Promise<Comment[]> =>
    apiRequest<Comment[]>(`/comments/document/${documentId}`),

  getById: (id: string): Promise<Comment> =>
    apiRequest<Comment>(`/comments/${id}`),

  update: (id: string, data: UpdateCommentRequest): Promise<Comment> =>
    apiRequest<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/comments/${id}`, {
      method: 'DELETE',
    }),
};

// Utility functions
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}; 