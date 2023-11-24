import jwt, { Secret } from "jsonwebtoken";
import {
    decodedJwtTokenI,
    generateAccessTokenI,
} from "../../api/models/interfaces/token.interface";

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

const decodeAccessToken = (token: string): Promise<decodedJwtTokenI> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET_ACCESS_KEY as Secret,
            (err, decoded) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(decoded);

                    resolve(decoded as decodedJwtTokenI);
                }
            },
        );
    });
};

const decodeRefreshToken = (token: string): Promise<decodedJwtTokenI> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET_REFRESH_KEY as Secret,
            (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded as decodedJwtTokenI);
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
