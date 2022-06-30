import config from '../src/config'
import { MessageHandler } from '../src/message-handler'

main();

async function main() {
    const handler = new MessageHandler(config.redis);
    await handler.initialize();
    const report = await handler.report();
    handler.dao.disconnect();
    console.log(report);
}
