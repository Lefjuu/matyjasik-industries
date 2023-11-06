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

// export interface createUserWithTokenI {
//     id: number;
//     password: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     verifyToken: string;
//     verifyTokenExpires: Date;
// }
