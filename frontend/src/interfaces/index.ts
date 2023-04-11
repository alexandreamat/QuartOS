export interface IUserProfile {
    email: string;
    isActive: boolean;
    isSuperuser: boolean;
    fullName: string;
    id: number;
}

export interface IUserProfileUpdate {
    email?: string;
    fullName?: string;
    password?: string;
    isActive?: boolean;
    isSuperuser?: boolean;
}

export interface IUserProfileCreate {
    email: string;
    fullName?: string;
    password?: string;
    isActive?: boolean;
    isSuperuser?: boolean;
}
