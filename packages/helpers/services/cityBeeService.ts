import fetch from "node-fetch";
import * as cheerio from "cheerio";
import {IService} from "../../types/types";
import {findCity} from "./findCity";

export async function getCityBeePrices() {
    const cityBeeRaw = await fetch(
        "https://backend.citybee.ee/api/AvailableServices/Get",
        {
            method: "GET",
            headers: {
                Client: "SelfService",
            },
        }
    ).then((res) => res.json());
    return await extractPricesCityBee(cityBeeRaw);
}

export async function getCityBeeLocations() {
    try {
        const cityBeeDataRaw = await fetch(
            "https://backend.citybee.ee/api/CarsLive/GetAvailableCars",
            {
                headers: {
                    Client: "SelfService",
                },
            }
        ).then((res) => res.json());
        const cityBeeData = extractLocations(cityBeeDataRaw);

        return { provider: "citybee", coordinates: cityBeeData };
    } catch (e) {
        console.log(e);
        return { provider: "citybee", coordinates: [] };
    }
}

function extractLocations(cityBeeDataRaw: any) {
    return cityBeeDataRaw.map((car: any) => {
        return {
            serviceId: car.service_id,
            carId: car.id,
            lat: car.lat,
            lng: car.long,
            city: findCity(car.lat, car.long),
        };
    });
}

async function extractPricesCityBee(cityBeeRaw: any) {
    const packages = await getCityBeePackages();
    return cityBeeRaw
        .filter((car: any) => car.IsVisible == true)
        .map((car: any) => {
            return {
                serviceId: car.ServiceId,
                name: car.ServiceName,
                petFriendly: true,
                //imageUrl: car.IconUri,
                price: {
                    minute: car.Pricing.minute_price,
                    hour: car.Pricing.hour_price,
                    day: car.Pricing.day_price,
                    week: car.Pricing.week_price,
                    month: car.Pricing.month_price,
                    km: car.Pricing.distance_prices[0].price,
                    minimum: 1.29,
                    start: 0.99,
                },
                packages: findPackage(car.ServiceName, packages),
                bodyType: car.ServiceCategory + "",
                motorType: "PETROL",
                gearbox: car.GearboxType + "",
                coordinates: [],
            } as IService;
        });
}

function findPackage(serviceName: string, packages: any[]) {
    const carPackages = packages.find((p) => p.serviceName === serviceName);
    if (carPackages) {
        return carPackages.packages;
    }
    const wrongNames: Record<string, string> = {
        "VW Crafter": "Volkswagen Crafter",
        "VW T-Cross": "Volkswagen T-Cross",
        "VW T-Roc R-Line": "Volkswagen T-Roc R-Line",
        "VW Taigo": "Volkswagen Taigo",
        "Kia Sportage": "KIA Sportage",
        "VW Tiguan": "Volkswagen Tiguan",
        "Fiat 500e": "Fiat e-500",
    };

    if (!carPackages && wrongNames[serviceName]) {
        return packages.find((p) => p.serviceName === wrongNames[serviceName])
            .packages;
    } else {
        console.log("Service not found: " + serviceName);
        return [];
    }
}

export async function getCityBeePackages() {
    try {
        let id = 0;
        const url = "https://citybee.ee/ee/paketid/";
        const response = await fetch(url);
        const body = await response.text();
        const $ = cheerio.load(body);
        const pricingTable = $(".trip-packages__packages");
        let output: string[] = [];
        const packages: any[] = [];
        pricingTable.children().each((i, elem) => {
            const subTableDurations: any[] = [];
            const subTableCars: string[] = [];
            const subTablePrices: any[] = [];
            const subTableDurationsElem = $(elem).find(
                ".packages-category__content__desktop__top__swiper > div"
            );
            // Durations
            subTableDurationsElem.children().each((i, elem) => {
                const duration = $(elem).text().trim();
                let hours = 0;
                let days = 0;
                const data = duration.split(/t|p/);
                if (duration.includes("t")) {
                    hours = parseInt(data[0]);
                } else if (duration.includes("p")) {
                    days = parseInt(data[0]);
                }
                const km = parseInt(data[1].trim().substring(1));
                subTableDurations.push({ hours, days, distance: km });
            });
            let carsInSubTable = 0;
            // Cars
            const subTableCarsElem = $(elem).find(
                ".packages-category__content__desktop__left"
            );
            subTableCarsElem.children().each((i, elem) => {
                carsInSubTable++;
                subTableCars.push($(elem).text().trim());
            });
            // Package prices
            const subTablePricesElem = $(elem).find(
                ".packages-category__content__desktop__right__swiper > div"
            );
            subTablePricesElem.children().each((i, elem) => {
                const packagePrices: number[] = [];
                $(elem)
                    .children()
                    .each((p, elem) => {
                        if (p < carsInSubTable)
                            packagePrices.push(parseFloat($(elem).text().trim()));
                    });
                subTablePrices.push(packagePrices);
            });
            for (let o = 0; o < carsInSubTable; o++) {
                const subPackages: any[] = [];
                for (let j = 0; j < subTableDurations.length; j++) {
                    subPackages.push({
                        ...subTableDurations[j],
                        price: subTablePrices[j][o],
                    });
                }
                packages.push({
                    serviceName: subTableCars[o],
                    packages: subPackages,
                });
            }
        });
        return packages;
    } catch (error) {
        throw new Error(`Failed to fetch webpage: ${error}`);
    }
}