const { app, HttpResponse } = require('@azure/functions');
const fs = require('fs');
const { createReadStream } = require('fs') 
const OpenAI = require('openai');
const { Transform, Readable } = require('stream');
const { ReadableStream } = require('web-streams-polyfill');

app.setup({ enableHttpStream: true });

const openai = new OpenAI({
    apiKey: process.env["apiKey"]
});

app.http('streamAI', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Streaming:
        const streamOpenAI = await openai.beta.chat.completions.stream({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Write a long poem' }],
            stream: true,
        });


        return {
            body: convertOpenAIStreamToExtractedContentStream(streamOpenAI),
            headers: {
                'Content-Type': 'text/event-stream'
            }
        }
    }
});

function convertOpenAIStreamToExtractedContentStream(streamOpenAI){
    let stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const part of streamOpenAI) {
                    controller.enqueue(part.choices[0]?.delta.content || '');
                }
                controller.close();
                return;
            } catch (err) {
                controller.close();
                throw error(500, 'Error while processing data stream.')
            }
        },
    })

    return stream;
}
