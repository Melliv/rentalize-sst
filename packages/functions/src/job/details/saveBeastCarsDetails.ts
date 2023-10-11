import AWS from "aws-sdk";
import {getBeastPrices} from "../../../../helpers/services/beastService";

export async function main() {
  try {
    const data = await getBeastPrices()

    const lambda = new AWS.Lambda();
    const params = {
      FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaPOSTapidetails5-246yWUqBkVjH',
      InvocationType: 'Event',
      Payload: JSON.stringify({provider: "beast", services: data}),
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