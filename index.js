exports.handler = async (eventBuffer, _) => {
    try {
        const event = JSON.parse(eventBuffer.toString());
        const headers = event.headers;

        // Check API Key
        const apikey = headers?.['Authorization'];
        if (process.env.API_KEY && apikey !== process.env.API_KEY)
            return {
                statusCode: 403,
                body: 'Forbidden'
            };

        // Parse the target URL
        const url = new URL(headers['X-Forward-To']);
        delete headers['X-Forward-To'];

        // Merge query parameters
        const params = new URLSearchParams(url.search);
        const override = event.queryParameters;
        for (const key in override)
            params.set(key, override[key]);
        url.search = params.toString();

        // Forward the request
        const method = event?.requestContext?.http?.method || 'GET';
        const body = ['GET', 'HEAD'].includes(method) ? null :
            event?.isBase64Encoded ?
                Buffer.from(event.body, 'base64').toString('utf-8') :
                event.body || '';
        const response = await fetch(url.toString(), {
            method: method,
            headers: headers,
            body: body,
        });

        return {
            statusCode: response.status,
            headers: response.headers.raw(),
            body: await response.text(),
            isBase64Encoded: false,
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'Internal Server Error'
        };
    }
};