import { EventEmitter } from 'node:events'
import { randomUUID } from 'node:crypto'
import url from 'node:url'
import WebSocket from 'ws'

interface SocketManagerOptions {
    ticketTTL?: number;
}

const defatultOptions: SocketManagerOptions = {
    // 15s lifetime for tickets
    ticketTTL: 15000,
}

export class SocketManager extends EventEmitter {
    private tickets: string[]
    private wss: WebSocket.Server | undefined
    private options: SocketManagerOptions

    constructor(opts?: SocketManagerOptions) {
        super();

        this.options = {
            ...defatultOptions,
            ...opts,
        };

        this.tickets = [];
    }

    async initialize() {
        this.wss = new WebSocket.Server({ noServer: true });

        // handle all new websocket connections from consumers
        this.wss.on('connection', (socket: any, req) => {
            let data = null;

            socket.lasMessageTime = new Date().getTime();

            socket.on('message', (buffer: Buffer, isBinary = false) => {
                socket.lastMessageTime = new Date().getTime();
                const message = buffer.toString();

                // auto-response handling
                if (message === 'pong') return;
                if (message === 'ping') return socket.send('pong');

                try {
                    // TODO: set up life cycle hooks to process messages
                    // for now, just assume JSON and bubble up via event
                    // for system to process.
                    const payload = message ? JSON.parse(message) : null;
                    this.emit('message', socket, payload);
                } catch (err: any) {
                    console.warn('error handling inbound message', err);
                }
            });

            this.emit('connect', { socket, data });
        });

        this.keepAlive();
    }

    private keepAlive() {
        const delay = 5000; // ping frequency
        const timeout = 30000;

        const tick = (function (this: SocketManager) {
            this.wss?.clients?.forEach(ws => ws.send('ping'));
            setTimeout(tick, delay);
        }).bind(this);

        const cleanup = (function (this: SocketManager) {
            const now = new Date().getTime();
            this.wss?.clients?.forEach((socket: any) => {
                if ((now - socket.lastMessageTime) > timeout) {
                    // stale connection, so destroy it
                    socket.destroy();
                }
            });
            setTimeout(cleanup, delay);
        }).bind(this);

        tick();
        cleanup();
    }

    // send a message to all open connections
    broadcast(data: any, isBinary = false) {
        const payload = JSON.stringify(data);
        this.wss?.clients.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload, { binary: isBinary });
            }
        });
    }

    // create an upgrade handler from the current state
    upgrade() {
        return (req, socket, head) => {
            const ticket = getTicket(req.url);
            const index = this.tickets.indexOf(ticket || '');

            if (index > -1) {
                // remove from the list of tickets, and resolve the connection
                this.tickets.splice(index, 1);
                console.log('upgrading...', this.wss);
                this.wss?.handleUpgrade(req, socket, head, async (socket) => {
                    this.wss?.emit('connection', socket, req);
                });
            } else {
                // send the 401 and forcibly close the connection
                socket.write('HTTP/1.1 401 Web Socket Protocol Handshake\r\n' +
                             'Upgrade: WebSocket\r\n' +
                             'Connection: Upgrade\r\n' +
                             '\r\n');
                socket.destroy();
            }
        }
    }

    // create a short-lived token that can be used to connect
    requestTicket() {
        const ticket = randomUUID();
        this.tickets.push(ticket);
        setTimeout(() => {
            // auto remove the ticket after the specified ttl
            this.tickets = this.tickets.filter(curr => curr !== ticket);
        }, this.options.ticketTTL);
        return ticket;
    }

    validateTicket(ticket: string) {
        const index = this.tickets.indexOf(ticket);
        return (index > -1);
    }
}

function getTicket(uri: string): string | null {
    let { ticket = null } = url.parse(uri, true).query;
    if (ticket instanceof Array) ticket = ticket[0];
    return ticket;
}
