import { EventEmitter } from 'node:events'
import needle from 'needle'
import WebSocket from 'ws'

interface SocketConnectorOptions {
    url: string
    requireAuth?: boolean
    authUrl?: string
    authToken?: string
}

const defaultOptions: any = {
    authUrl: null,
    authToken: null,
    requireAuth: false,
    url: null,
}

export class SocketConnection extends EventEmitter {
    private options: SocketConnectorOptions
    private socket: WebSocket.WebSocket | undefined

    constructor(opts: SocketConnectorOptions) {
        super();
        this.options = {
            ...defaultOptions,
            ...opts,
        };
    }

    async connect() {
        let { url } = this.options;
        if (this.options.requireAuth) {
            const result = await this.authorize();
            url = `${url}?ticket=${result.ticket}`;
        }

        const socket = new WebSocket(url);
        socket.on('error', err => console.warn(err));
        socket.on('open', heartbeat);
        socket.on('ping', heartbeat);
        socket.on('message', message => this.emit('message', message));
        socket.on('close', function clear(this: any) {
            clearTimeout(this.pingTimeout);
        });

        this.socket = socket;
    }

    async authorize() {
        const { authToken, authUrl } = this.options;
        const token = Buffer.from(authToken as string).toString('base64');

        const response = await needle('post', authUrl as string, {}, {
            headers: {
                'authorization': `Bearer ${token}`,
            }
        });

        if (response.statusCode !== 200) {
            throw new Error(response.body);
        }

        return response.body;
    }
}

function heartbeat(this: any) {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
        this.terminat();
    }, 30000 + 1000);
}