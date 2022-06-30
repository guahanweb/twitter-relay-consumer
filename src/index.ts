import config from './config'
import logger from './logger'
import { SocketConnection } from './socket-manager/connection'
import { MessageHandler } from './message-handler'

main();

async function main() {
    try {
        // set up our handler object
        const handler = new MessageHandler(config.redis);
        await handler.initialize();

        // set up socket connection
        const socket = await connect();
        socket.on('message', message => {
            // wire up our inbound messages to our handler
            const payload = JSON.parse(message);
            handler.process(payload);
        });

        logger.info('consumer is connected', { to: config.relay.websocketUrl });
    } catch (err: any) {
        logger.error('failed initialization', { err });
    }
}

async function connect() {
    const { relay } = config;

    const socket = new SocketConnection({
        requireAuth: true,
        authToken: relay.authToken,
        authUrl: relay.authUrl,
        url: relay.websocketUrl,
    });

    await socket.connect();
    return socket;
}
