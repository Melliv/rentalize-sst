import {getBoltLocationsData} from "../../../helpers/services/boltService";
import AWS from "aws-sdk";
import * as fs from "fs";
import {getCityBeeLocations} from "../../../helpers/services/cityBeeService";
export async function main() {
    try {
        const [boltData, cityBeeData] = await Promise.all([
            getBoltLocationsData(),
            getCityBeeLocations(),
        ]);

        const lambda = new AWS.Lambda();
        const params = {
            FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaPOSTapilocation-6b2IbK6tD98b',
            InvocationType: 'Event',
            Payload: JSON.stringify({ bolt: boltData, cityBee: cityBeeData}),
        };
        await lambda.invoke(params).promise()

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
            body: JSON.stringify({ message: 'Error' }),
        };
    }
}
