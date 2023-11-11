import Redis, { Redis as RedisClient } from "ioredis";
import {
    expireRedisI,
    setRedisI,
} from "../api/models/interfaces/token.interface";

type SetFunction = (args: setRedisI) => Promise<string | null>;
type GetFunction = (key: string) => Promise<string | null>;
type ExpireFunction = (args: expireRedisI) => Promise<number>;

let redis: RedisClient | undefined;

const connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        let r: RedisClient;
        if (process.env.PROJECT_MODE === "development") {
            r = new Redis(
                `${process.env.REDIS_HOSTNAME_DEV}:${process.env.REDIS_PORT}`,
            );
        } else {
            r = new Redis(
                `${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`,
            );
        }

        r.on("connect", function () {
            console.log("✔️  Redis: connected");
            redis = r;
            resolve();
        });

        r.on("error", (err) => {
            console.error("❌ Redis: error");
            reject(err);
        });
    });
};

const set: SetFunction = async (args) => {
    if (!redis) {
        throw new Error("Redis connection is not established.");
    }
    return redis.set(
        args.key,
        args.token,
        args.expirationFlag,
        args.expiration,
    );
};

const get: GetFunction = async (key) => {
    if (!redis) {
        throw new Error("Redis connection is not established.");
    }
    return redis.get(key);
};

const expire: ExpireFunction = async (args) => {
    if (!redis) {
        throw new Error("Redis connection is not established.");
    }
    return redis.expire(args.key, args.expiration);
};

export { connect, redis, set, get, expire };
