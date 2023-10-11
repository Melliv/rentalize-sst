import Redis from "ioredis";
import {IDetailObj, ILocationObj, IService} from "../../../../types/types";

export async function main() {
  let client
  try {
    client = new Redis({
      port: 6379,
      host: "clustercfg.rentalize-momerydb.72qioy.memorydb.eu-north-1.amazonaws.com",
      tls: {},
    });

    const locationStr = await client.get("location")

    if (!locationStr) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not found' }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Cache-Control": "public, max-age=55"
      },
      body: locationStr,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error connecting to AWS MemoryDB' }),
    };
  } finally {
    if (client) client.disconnect()
  }
}
