export interface signupResponseI {
    message: string;
}

export interface createUserI {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface updateUserI {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface createdUserI {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    verifyToken: string;
    verifyTokenExpires: Date;
    verified: boolean;
}

export interface loginResponseI {
    accessToken: string;
    refreshToken: string;
    data: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export interface userI {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export interface decodedUserI {
    id: string;
    key: string;
    iat: number;
    role: string;
}
