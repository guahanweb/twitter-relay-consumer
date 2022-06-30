import * as fs from 'node:fs'
import * as path from 'node:path';
import * as dotenv from 'dotenv';

const env = loadFromEnv('NODE_ENV', 'development');
const loadEnv = parseInt(loadFromEnv('LOAD_ENV_FILE', 1));

if (loadEnv) {
    const fallback_list = [`.${env}.env`, '.env'];
    let loaded = false;
    for (let i = 0; i < fallback_list.length; i++) {
        const filename = path.resolve(__dirname, '..', fallback_list[i]);
        if (!loaded && fs.existsSync(filename)) {
            dotenv.config({
                path: filename,
            });
            loaded = true;
        }
    }
}

export interface RedisConfig {
    host: string | null;
    port: string | null;
    password?: string | null;
}

export interface RelayConfig {
    authToken: string;
    authUrl: string;
    websocketUrl: string;
}

export interface AppConfig {
    logLevel: string;
    redis: RedisConfig;
    relay: RelayConfig;
}

const init = function(): AppConfig {
    return {
        logLevel: loadFromEnv('LOG_LEVEL', 'info'),

        redis: {
            host: loadFromEnv('REDIS_HOST', 'localhost'),
            port: loadFromEnv('REDIS_PORT', 6379),
            password: loadFromEnv('REDIS_PASSWORD'),
        },

        relay: {
            authToken: loadFromEnv('RELAY_AUTH_TOKEN', 'testing'),
            authUrl: loadFromEnv('RELAY_AUTH_URL', 'http://localhost:3000/connect'),
            websocketUrl: loadFromEnv('RELAY_WEBSOCKET_URL', 'ws://localhost:3000/ws'),
        }
    };
}

export default init();

function loadFromEnv(key: string, defaultValue: any = null) {
    const value = process.env && process.env[key];
    return value || defaultValue;
}
