export declare enum UserRole {
    USER = "user",
    MODERATOR = "moderator",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
    get canModerate(): boolean;
    get isAdmin(): boolean;
}
