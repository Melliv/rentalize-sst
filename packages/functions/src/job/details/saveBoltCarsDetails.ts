import AWS from "aws-sdk";
import {getBoltPrices} from "../../../../helpers/services/boltService";

export async function main() {
  try {
    const data = await getBoltPrices()

    const lambda = new AWS.Lambda();
    const params = {
      FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaPOSTapidetails5-246yWUqBkVjH',
      InvocationType: 'Event',
      Payload: JSON.stringify({provider: "bolt", services: data}),
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