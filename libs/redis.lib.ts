import Redis, { Redis as RedisClient } from "ioredis";

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

type SetFunction = (...args: string[]) => Promise<string | null>;
type GetFunction = (...args: string[]) => Promise<string | null>;
type ExpireFunction = (...args: string[]) => Promise<number>;

const set: SetFunction = async (...args) => {
    if (!redis) {
        throw new Error("Redis connection is not established.");
    }
    return redis.set(...args);
};

const get: GetFunction = async (...args) => {
    if (!redis) {
        throw new Error("Redis connection is not established.");
    }
    return redis.get(...args);
};

const expire: ExpireFunction = async (...args) => {
    if (!redis) {
        throw new Error("Redis connection is not established.");
    }
    return redis.expire(...args);
};

export { connect, redis, set, get, expire };
