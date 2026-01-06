const { MongoClient } = require('mongodb');

// Esta variable es un "truco" de rendimiento. 
// La dejamos fuera de la función para que, si la Lambda se ejecuta 
// muchas veces seguidas, no tenga que volver a conectarse desde cero.
let cachedDb = null;

async function connectToDatabase() {
  // Si ya tenemos una conexión abierta, ¡úsala y no pierdas tiempo!
  if (cachedDb) {
    console.log('=> Reutilizando la conexión existente a MongoDB');
    return cachedDb;
  }

  // Si no hay conexión, vamos a crear una nueva usando la URL secreta de nuestro .env
  console.log('=> Creando una nueva conexión a MongoDB...');
  const client = await MongoClient.connect(process.env.MONGO_URI);

  // Elegimos la base de datos (puedes ponerle el nombre que quieras)
  const db = client.db('mi_acortador_db');
  
  // Guardamos la conexión en nuestra variable "caché" para la próxima vez
  cachedDb = db;
  return db;
}

module.exports = { connectToDatabase };