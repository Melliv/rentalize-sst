import fetch from "node-fetch";
import type {
  IBoltDataRaw,
  IBoltCarDetailsResponse, IBoltCarDetailsResponseData, ICarDetailsResponseDataItemData,
  Category,
  ILocation,
  ILocationFull,
  IPrice,
  IService,
  IVehicle
} from "../../types/types";
import {findCity} from "./findCity";


const token = "Basic KzM3MjU4MjAxMDA0OjU5ZmY5ZTc0LWYyYjAtNDVmNy1hN2E0LTY3N2MxMWE2ODhmYg=="
const groupBy = <T, K extends keyof string>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

export async function getBoltPrices() {
  const data = await getBoltLocationsData();
  const cars = groupBy(data.coordinates, location => location.serviceId)
  return await extractPricesBolt(cars);
}

export async function getBoltLocationsData(): Promise<ILocationFull> {
  const boltDataRaw = await getBoltAvailableCarsDataRaw()
  return extractLocationsBoltData(boltDataRaw);
}
async function getBoltAvailableCarsDataRaw(): Promise<IBoltDataRaw> {
	const estoniaViewPort = {
		viewport: {
			north_east: {
				lat: 59.82,
				lng: 28.2
			},
			south_west: {
				lat: 57.7,
				lng: 23.56
			}
		}
	};
	try {
		const boltDataRaw = (await fetch(
			'https://user.live.boltsvc.net/carsharing/search/getVehicles?version=CA.58.2&deviceId=3923f3dd-e445-45b3-8c4c-b1b08734b982&device_name=Googlesdk_gphone64_arm64&device_os_version=12&channel=googleplay&deviceType=android&country=ee&language=en&gps_lat=59.43696&gps_lng=24.753573&gps_accuracy_m=5.0&gps_age=319&user_id=111711966&session_id=111711966u1675606827994&rh_session_id=111711966u1675606827',
			{
				headers: {
					'content-type': 'application/json',
					authorization: token
				},
				method: 'POST',
				body: JSON.stringify(estoniaViewPort)
			}
		).then((res) => res.json())) as IBoltDataRaw;
		return boltDataRaw;
	} catch (e) {
		console.error(e);
    throw "Bold car details fetch error!"
	}
}

async function extractPricesBolt(cars: Record<number, ILocation[]>) {
  const details: IService[] = [];

  let counter = 0
  for (const key in cars) {
    counter++
    const carId = cars[key][0].carId
    const serviceId = cars[key][0].serviceId
    const waitExtra = counter % 10 === 0
    const carDetailsResponse = await detailsRequest(carId, waitExtra);
    console.log(
      "ServiceId:",
      serviceId,
      "CarId:",
      carId,
      carDetailsResponse.message
    ); // for debugging
    if (carDetailsResponse.message !== "OK") {
      console.error("Bolt car details data fetch error!")
      continue;
    }
    details.push(buildServiceDetails(serviceId, carDetailsResponse.data));
  }

  return details;

  async function detailsRequest(carId: number, waitExtra: boolean) {
    const waitTime = 20 + (waitExtra ? 500 : 0)
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    return await getBoltCarDetailsRaw(carId);
  }

  function buildServiceDetails(serviceId: number, data: IBoltCarDetailsResponseData): IService {
    const vehicle_card = data.vehicle_card;

    const price: IPrice = {
      km: 0,
      minute: 0,
      hour: 0,
      day: 0,
      minimum: 0,
    }
    vehicle_card.blocks[2].payload.items.forEach((attr: ICarDetailsResponseDataItemData) => {
      const text_html = attr.text_html.toLowerCase();
      if (text_html.includes("distance")) {
        price.km = parseFloat(attr.value_html)
      } else if (text_html.includes("minute")) {
        price.minute = parseFloat(attr.value_html)
      } else if (text_html.includes("hour")) {
        price.hour = parseFloat(attr.value_html)
      } else if (text_html.includes("day")) {
        price.day = parseFloat(attr.value_html)
      } else if (text_html.includes("minimum")) {
        price.minimum = parseFloat(attr.value_html)
      }
    })

    const gearbox = vehicle_card.header.brief_info.find((attr: {subtitle_html: string}) =>
      attr.subtitle_html.toLowerCase().includes("gearbox")
    )?.title_html

    const city = findCity(
      vehicle_card.blocks[1].payload.location.lat,
      vehicle_card.blocks[1].payload.location.lng
    )

    return {
      serviceId: serviceId,
      name: vehicle_card.header.collapsed_title,
      //imageUrl: vehicle_card.header.images[0],
      price: price,
      bodyType: data.city_area_filters[1].value,
      gearbox: gearbox,
      petFriendly: true,
      coordinates: [],
      packages: [],
      motorType: "PETROL",
      cities: [city],
    } as IService;
  }
}

async function getBoltCarDetailsRaw(vehicleId: number): Promise<IBoltCarDetailsResponse> {
  return await fetch(
    "https://user.live.boltsvc.net/carsharing/vehicle/getDetails?vehicle_id=" +
    vehicleId +
    "&payment_method_id=5816271292257459&payment_method_type=adyen&version=CA.59.1&deviceId=f5f3266e-6064-44e9-a6cf-8ad2a6d832ab&device_name=Googlesdk_gphone64_arm64&device_os_version=12&channel=googleplay&deviceType=android&country=ee&language=en&gps_lat=59.43696&gps_lng=24.753573&gps_accuracy_m=5.0&gps_age=11&user_id=46981607&session_id=46981607u1675614707154&rh_session_id=46981607u1675614706",
    {
      headers: {
        "content-type": "application/json",
        authorization: token,
      },
      method: "GET",
    }
  ).then((res) => res.json()) as IBoltCarDetailsResponse;
}

function extractLocationsBoltData(boltDataRaw: IBoltDataRaw): ILocationFull {
  const boltData: ILocation[] = [];
  boltDataRaw.data.categories.forEach(c => boltData.push(...boltCategoryAllLocations(c)))

  return { provider: "bolt", coordinates: boltData };
}

function boltCategoryAllLocations(
  category: Category
): ILocation[] {
  return category.vehicles.map((vehicle: IVehicle) => {
    return {
      serviceId: parseInt(category.id),
      carId: vehicle.id,
      lat: vehicle.location.lat,
      lng: vehicle.location.lng,
      city: findCity(vehicle.location.lat, vehicle.location.lng),
    };
  });
}
