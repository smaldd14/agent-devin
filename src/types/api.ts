// src/types/api.ts

// Basic response type
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// User types
export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export type UserResponse = ApiResponse<User>;
export type UsersResponse = ApiResponse<User[]>;