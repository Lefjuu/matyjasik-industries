import {
    decodedTokenI,
    expireRedisI,
    setRedisI,
} from "../../api/models/interfaces/token.interface";
import { expire, set } from "../../libs/redis.lib";
import { decodeAccessToken, generateAccessToken } from "./jwt.util";
import { get } from "http";

const generateSessionToken = async (id: number, role: string) => {
    const key = `${id}:${hash(8)}`;
    const token = await generateAccessToken({ key, role });

    const expirationTime = process.env.REDIS_EXPIRES_IN || "";

    if (token) {
        const redisArgs: setRedisI = {
            key,
            token,
            expirationFlag: "EX",
            expiration: expirationTime,
        };

        await set(redisArgs);
        return token;
    }

    throw "The key could not be created";
};

const check = async (token: string) => {
    const decoded = (await decodeAccessToken(token)) as decodedTokenI;

    const data = await get(decoded.key);
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
            // deleted expirationFlag "EX"
            expiration: process.env.REDIS_EXPIRES_IN || "",
        };
        await expire(redisArgs);
    } catch (err) {
        console.error("Error renewing session:", err);
        return null;
    }
};

const hash = (length: number) => {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
};

export { check, renew, generateSessionToken };
