import AWS from "aws-sdk";
import {getCityBeePrices} from "../../../../helpers/services/cityBeeService";

export async function main() {
  try {
    const data = await getCityBeePrices()

    console.log("test1")
    const lambda = new AWS.Lambda();
    const params = {
      FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaPOSTapidetails5-246yWUqBkVjH',
      InvocationType: 'Event',
      Payload: JSON.stringify({provider: "cityBee", services: data}),
    };
    await lambda.invoke(params).promise()

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
        message: "Error",
      }),
    };
  }
}