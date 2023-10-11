import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { IService } from "../../types/types";

const images = [
    {
        name: "volkswagen",
        url: "https://elmorent.ee/wp-content/uploads/2020/08/VW-e-Up20.png",
    },
    {
        name: "citigo",
        url: "https://elmorent.ee/wp-content/uploads/2020/08/Skoda-Citigo20.png",
    },
    {
        name: "yaris",
        url: "https://raw.githubusercontent.com/KaarelVesilind/carrentalcomparison/main/src/assets/providers/elmo/cars/Toyota-Yaris-Hybrid.png",
    },
    {
        name: "clio",
        url: "https://elmorent.ee/wp-content/uploads/2021/07/Clio-600x338.png",
    },
    {
        name: "leaf",
        url: "https://elmorent.ee/wp-content/uploads/2017/07/Elmo-rent-nissan-leaf-1.png",
    },
    {
        name: "e208",
        url: "https://elmorent.ee/wp-content/uploads/2020/12/Peugeot-e-208-GT.png",
    },
    {
        name: "arkana",
        url: "https://elmorent.ee/wp-content/uploads/2021/10/Arkana_kodulehele.png",
    },
    {
        name: "zoe",
        url: "https://elmorent.ee/wp-content/uploads/2020/05/Renault-Zoe-20.png",
    },
    {
        name: "model 3",
        url: "https://elmorent.ee/wp-content/uploads/2021/08/ELMO-Tesla.png",
    },
    {
        name: "model y",
        url: "https://elmorent.ee/wp-content/uploads/2023/04/ef135341b534317b4003950bc1b6b2e46c780cf225e7035af6ab60c1e328c8f1.jpg",
    },
];

export async function getElmoPrices() {
    try {
        let id = 0;
        const url = "https://elmorent.ee/uus-hinnakiri/";
        const response = await fetch(url);
        const body = await response.text();
        const $ = cheerio.load(body);
        const pricingTable = $("#tablepress-12 > tbody");

        if (pricingTable.length === 0) {
            throw new Error("Pricing table not found");
        }

        const output: IService[] = [];
        let type = "";
        pricingTable.children().each((index, element) => {
            const tableRow = $(element);
            if (!tableRow.is("tr")) {
                return;
            }

            const name = tableRow.find(".column-1").text().trim();

            if (["eco", "comfy", "classy"].includes(name.toLowerCase())) {
                type = name.toLowerCase();
                return;
            }

            output.push({
                serviceId: id++,
                name,
                bodyType: type,
                motorType: "electric",
                petFriendly: true,
                gearbox: "AUTOMATIC",
                imageUrl:
                    images.find((image) => name.toLowerCase().includes(image.name))
                        ?.url ?? "",
                price: {
                    km: parseFloat(tableRow.find(".column-5").text().trim()),
                    minute: parseFloat(tableRow.find(".column-2").text().trim()),
                    hour: parseFloat(tableRow.find(".column-3").text().trim()),
                    day: parseFloat(tableRow.find(".column-4").text().trim()),
                },
                packages: [
                    {
                        days: 7,
                        distance: 700,
                        price: parseFloat(tableRow.find(".column-7").text().trim()),
                    },
                    {
                        days: 30,
                        distance: 3000,
                        price: parseFloat(tableRow.find(".column-8").text().trim()),
                    },
                ],
                coordinates: [],
            });
        });

        return output;
    } catch (error) {
        throw new Error(`Failed to fetch webpage: ${error}`);
    }
}