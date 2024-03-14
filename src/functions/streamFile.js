const { app, HttpResponse } = require('@azure/functions');
const fs = require('fs');
const { createReadStream } = require('fs') 
const OpenAI = require('openai');
const { Transform, Readable } = require('stream');
const { ReadableStream } = require('web-streams-polyfill');

app.setup({ enableHttpStream: true });

app.http('streamFile', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const stream = createReadStream('./test.txt');

        return {
            body: stream
        }
    }
});
