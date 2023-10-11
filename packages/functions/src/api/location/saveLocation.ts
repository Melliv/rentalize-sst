import Redis from "ioredis";
import {IDetailObj, ILocationObj, DetailObj} from "../../../../types/types";

export async function main(locationObj: ILocationObj) {
  let client
  try {
    client = new Redis({
      port: 6379,
      host: "clustercfg.rentalize-momerydb.72qioy.memorydb.eu-north-1.amazonaws.com",
      tls: {},
    });

    const detailStr  = await client.hgetall("detail");
    if (!detailStr) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Detail info not found' }),
      }
    }

    let detail: IDetailObj = new DetailObj
    for (const [key, value] of Object.entries(detailStr)) {
      // @ts-ignore
      detail[key] = JSON.parse(value)
    }

    for (const [key] of Object.entries(detail)) {
      if (key == "bolt" || key == "cityBee") {
        for (const service of detail[key]) {
          service.coordinates = [
            ...locationObj[key].coordinates.filter(
                (item: any) => item.serviceId == service.serviceId
            ),
          ];
        }
      }
    }

    await client.set("location", JSON.stringify([
      {
        provider: "bolt",
        services: detail.bolt
      },
      {
        provider: "citybee",
        services: detail.cityBee
      },
      {
        provider: "elmo",
        services: detail.elmo
      },
      {
        provider: "beast",
        services: detail.beast
      }
    ]));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "OK",
      }),
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
