const axios = require('axios');
exports.redirector = async (event, _) => {
    try {
        const eventObj = JSON.parse(event.toString());
        const headers = eventObj.headers;
        const body = eventObj.body;
        const targetUrl = headers?.['X-Api-Redirect'];
        if (!targetUrl) {
            console.error('Missing X-Api-Redirect header');
            return {
                statusCode: 400,
                body: 'Missing X-Api-Redirect header'
            };
        }
        delete headers['X-Api-Redirect'];
        const requestBody = eventObj.isBase64Encoded ?
            new Buffer.from(body, 'base64') :
            Buffer.from(body, 'utf-8');
        const res = await axios({
            method: eventObj.httpMethod,
            url: targetUrl,
            headers: headers,
            data: requestBody
        });
        return {
            statusCode: res.status,
            headers: res.headers,
            body: res.data,
            isBase64Encoded: false
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'Internal Server Error'
        };
    }
};