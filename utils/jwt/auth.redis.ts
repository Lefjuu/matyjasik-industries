import {
    decodedTokenI,
    expireRedisI,
    setRedisI,
} from "../../api/models/interfaces/token.interface";
import redisLib from "../../libs/redis.lib";
import jwtUtils from "./jwt.util";
import commonUtils from "../common.util";

const generateSessionToken = async (id: number, role: string) => {
    const key = `${id}:${commonUtils.generateHash(8)}`;
    const token = await jwtUtils.generateAccessToken({ key, role });

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
    const decoded = (await jwtUtils.decodeAccessToken(token)) as decodedTokenI;

    const data = await redisLib.get(decoded.key);
    if (decoded.key) {
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
