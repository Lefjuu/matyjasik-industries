import jwt, { Secret } from "jsonwebtoken";
import { generateAccessTokenI } from "../../api/models/interfaces/token.interface";

const generateAccessToken = async (data: generateAccessTokenI) => {
    try {
        return await jwt.sign(data, process.env.JWT_SECRET_ACCESS_KEY || "");
    } catch (err) {
        return null;
    }
};
const generateRefreshToken = (id: number): string => {
    return jwt.sign(
        { userId: id },
        process.env.JWT_SECRET_REFRESH_KEY as Secret,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        },
    );
};

// TODO: type of decode
const decodeAccessToken = (token: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET_ACCESS_KEY as Secret,
            (err, decoded) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(decoded);
                }
            },
        );
    });
};

const decodeRefreshToken = (token: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET_REFRESH_KEY as Secret,
            (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            },
        );
    });
};

export default {
    generateAccessToken,
    generateRefreshToken,
    decodeAccessToken,
    decodeRefreshToken,
};
