export interface decodedTokenI {
    key: string;
    role: string;
    iat: number;
}

export interface generateAccessTokenI {
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
