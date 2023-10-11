import AWS from "aws-sdk";

export async function main() {
  try {
    const lambda = new AWS.Lambda();

    await Promise.all([
      lambda.invoke({
        FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaGETapijobdetail-NJZnq7jh2KWj', // bolt
        InvocationType: 'Event'
      }).promise(),
      lambda.invoke({
        FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaGETapijobdetail-hS6xDXKSKLYS', // cityBee
        InvocationType: 'Event'
      }).promise(),
      lambda.invoke({
        FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaGETapijobdetail-CoOqaCzd5hGk', // beast
        InvocationType: 'Event'
      }).promise(),
      lambda.invoke({
        FunctionName: 'arn:aws:lambda:eu-north-1:421807535843:function:prod-rentalize-sst-MainSt-ApiLambdaGETapijobdetail-85fEktQJ2vyV', // elmo
        InvocationType: 'Event'
      }).promise()
    ])

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