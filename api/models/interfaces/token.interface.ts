export interface decodedTokenI {
    userId: number;
    key: string;
    role: string;
    iat: number;
    exp: number;
}

export interface decodedJwtTokenI {
    userId: number;
    iat: number;
    exp: number;
    key: string;
    role: string;
    id: string;
}

export interface generateAccessTokenI {
    userId: number;
    key: string;
    role: string;
}

export interface setRedisI {
    key: string;
    token: string;
    expirationFlag: "EX";
    expiration: string | number;
}

export interface expireRedisI {
    key: string;
    expiration: string | number;
}
