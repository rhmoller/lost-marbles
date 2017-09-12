
type MessageHandler = (topic: string, message: object) => void;

const topics: { [topic: string]: MessageHandler[] } = {};

export function subscribe(topic: string, handler: MessageHandler) {
    let handlers = topics[topic];
    if (!handlers) {
        handlers = [];
        topics[topic] = handlers;
    }
    handlers.push(handler);
}

export function unsubsribe(topic: string, handler: MessageHandler) {
    const handlers = topics[topic];
    const idx = handlers.indexOf(handler);
    handlers.splice(idx, 1);
}

export function publish(topic: string, message: object) {
    const handlers = topics[topic];
    if (handlers) {
        handlers.forEach((handler) => handler(topic, message));
    }
}
