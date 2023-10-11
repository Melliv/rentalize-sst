import Redis from "ioredis";
import {IService, IServiceFull} from "../../../../types/types";

export async function main(serviceFull: IServiceFull) {
  let client
  try {
    client = new Redis({
      port: 6379,
      host: "clustercfg.rentalize-momerydb.72qioy.memorydb.eu-north-1.amazonaws.com",
      tls: {},
    });

    const oldDetails = await client.hget("detail", serviceFull.provider)
    const formattedOldDetails: IService[] = oldDetails ? JSON.parse(oldDetails) : []
    const dictFinalDetails = formattedOldDetails.reduce((acc, detail) => {
      acc[detail.serviceId] = detail;
      return acc;
    }, {} as Record<string, IService>);

    for (const detail of serviceFull.services) {
      dictFinalDetails[detail.serviceId] = detail;
    }

    await client.hset("detail", {[serviceFull.provider]: JSON.stringify(Object.values(dictFinalDetails))})

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "OK",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "ERROR",
      }),
    };
  } finally {
    if (client) client.disconnect()
  }
}