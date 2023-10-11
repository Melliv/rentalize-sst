import * as cheerio from "cheerio";
import fetch from "node-fetch";
import {IService} from "../../types/types";


export interface IColumn {
    titleCaption: String,
    features: String[]
}
export async function getBeastPrices() {
    try {
        const output: any[] = [];
        const url = "https://beast.rent/et/hinnad/";
        const response = await fetch(url);
        const body = await response.text();
        const $ = cheerio.load(body);
        const pricingTable = $(".elfsight-widget-pricing-table");
        const encodedTable = pricingTable.attr(
            "data-elfsight-pricing-table-options"
        );
        const decodedTable = decodeURIComponent(encodedTable!);
        const parsedTable = JSON.parse(decodedTable);
        let serviceId = 0;
        parsedTable.columns!.forEach((column: IColumn) => {
            const carModels = column.titleCaption.split("<br> ");
            carModels.forEach((carModel) => {
                output.push({
                    serviceId: serviceId++,
                    name: carModel.trim(),
                    price: buildBeastPriceObject(column.features),
                    bodyType: "SEDAN",
                    motorType: "electric",
                    petFriendly: true,
                    gearbox: "AUTOMATIC",
                    // imageUrl:
                    //   images.find((image) => carModel.toLowerCase().includes(image.name))
                    //     ?.url ?? "",
                    packages: [],
                    coordinates: [],
                } as IService);
            });
        });

        return output;
    } catch (error) {
        throw new Error(`Failed to fetch webpage: ${error}`);
    }
}

function buildBeastPriceObject(features: any) {
    return {
        km: parseFloat(features[5].text),
        minute: parseFloat(features[1].text),
        day: parseFloat(features[2].text.substring(8)),
        threeDays: parseFloat(features[3].text),
        week: parseFloat(features[4].text),
        start: parseFloat(features[0].text.substring(24)),
        deposit: {
            base: parseFloat(features[6].text),
            special: parseFloat(features[7].text.substring(20)),
        },
    };
}
const images = [
    {
        name: "model 3",
        url: "https://beast.rent/wp-content/uploads/2023/02/beast_m3lr_eb_ib_21.jpg",
    },
    {
        name: "model y",
        url: "https://beast.rent/wp-content/uploads/2022/03/beast_mYlr_er_ib_r19-4.jpg",
    },
    {
        name: "model x",
        url: "https://beast.rent/wp-content/uploads/2021/04/P100D-X-Icon-V2.png",
    },
    {
        name: "model s",
        url: "https://beast.rent/wp-content/uploads/2023/02/beast_m3lr_eb_ib_21.jpg",
    },
];