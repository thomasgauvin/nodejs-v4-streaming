const { app, HttpResponse } = require('@azure/functions');
const fs = require('fs');
const { createReadStream } = require('fs') 
const OpenAI = require('openai');
const { Transform, Readable } = require('stream');
const { ReadableStream } = require('web-streams-polyfill');

app.setup({ enableHttpStream: true });

app.http('streamPoem', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const shortPoem = `
            Roses are red,
            Violets are blue,
            Sugar is sweet,
            And so are you.
        `

        const poem = shortPoem.repeat(20);

        const delayedStream = ReadableStream.from(stringToDelayedStream(poem, 100))

        return {
            body: delayedStream,
            headers: {
                'Content-Type': 'text/event-stream'
            }
        }
    }
});

function stringToDelayedStream(str, delay) {
    const decoder = new TextDecoder();

    const lines = str.split('\n');
    let index = 0;

    return new ReadableStream({
        start(controller) {
            const interval = setInterval(() => {
                if (index < lines.length) {
                    const line = lines[index] + '\n';
                    controller.enqueue(line);
                    index++;
                } else {
                    clearInterval(interval);
                    controller.close(); // Mark the end of the stream
                }
            }, delay);
        }
    });
}