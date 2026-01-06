const { nanoid } = require('nanoid');
const { connectToDatabase } = require('./db');

module.exports.createShortUrl = async (event) => {
  try {
    const db = await connectToDatabase();
    const { originalUrl } = JSON.parse(event.body);

    if (!originalUrl) {
      return { 
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": true },
        body: JSON.stringify({ error: "URL requerida" }) 
      };
    }

    const shortCode = nanoid(7);
    await db.collection('urls').insertOne({ originalUrl, shortCode, clicks: 0, createdAt: new Date() });

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "¡Listo!",
        // AQUÍ PEGA TU URL HASTA /dev/ (SIN LAS LLAVES {})
        shortUrl: `https://uw6l1kwf0i.execute-api.us-east-1.amazonaws.com/dev/${shortCode}`
      })
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": true },
      body: JSON.stringify({ error: err.message }) 
    };
  }
};

module.exports.redirectUrl = async (event) => {
  try {
    const db = await connectToDatabase();
    const { shortCode } = event.pathParameters;
    const linkEncontrado = await db.collection('urls').findOne({ shortCode });

    if (!linkEncontrado) return { 
      statusCode: 404, 
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "No existe" }) 
    };

    await db.collection('urls').updateOne({ _id: linkEncontrado._id }, { $inc: { clicks: 1 } });

    return {
      statusCode: 301,
      headers: { 
        Location: linkEncontrado.originalUrl, 
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      }
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Error" }) 
    };
  }
};