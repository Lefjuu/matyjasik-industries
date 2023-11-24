import {
    decodedJwtTokenI,
    expireRedisI,
    setRedisI,
} from "../../api/models/interfaces/token.interface";
import redisLib from "../../libs/redis.lib";
import jwtUtils from "./jwt.util";
import commonUtils from "../common.util";

const generateSessionToken = async (userId: number, role: string) => {
    const key = `${userId}:${commonUtils.generateHash(8)}`;
    const token = await jwtUtils.generateAccessToken({
        key,
        role,
        userId,
    });

    const expirationTime = process.env.REDIS_EXPIRES_IN || "";

    if (token) {
        const redisArgs: setRedisI = {
            key,
            token,
            expirationFlag: "EX",
            expiration: expirationTime,
        };

        await redisLib.set(redisArgs);
        return token;
    }

    throw "The key could not be created";
};

const check = async (token: string) => {
    const decoded: decodedJwtTokenI = await jwtUtils.decodeAccessToken(token);

    if (decoded.key) {
        const data = await redisLib.get(decoded.key);
        const id = decoded.key.split(":");
        return decoded.key && data ? { ...decoded, id: id[0] } : null;
    }
    return null;
};

const renew = async (key: string): Promise<void | null> => {
    try {
        const redisArgs: expireRedisI = {
            key,
            // deleted expirationFlag "EXa"
            expiration: process.env.REDIS_EXPIRES_IN || "",
        };
        await redisLib.expire(redisArgs);
    } catch (err) {
        console.error("Error renewing session:", err);
        return null;
    }
};

export default { check, renew, generateSessionToken };
