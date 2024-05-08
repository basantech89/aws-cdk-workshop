const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda')

const dbClient = new DynamoDBClient({ region: 'us-east-1' })
const lambdaClient = new LambdaClient({ region: 'us-east-1' })

const sendCommand = async (command, client) => {
  try {
    const result = await client.send(command)
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.log(e);
  }
}

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2))

  // update dynamo entry for "path" with hits++
  const dbItemUpdateCommand = new UpdateItemCommand({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  })

  await sendCommand(dbItemUpdateCommand, dbClient)

  // call downstream function and capture response
  const lambdaInvokeCommand = new InvokeCommand({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  })

  const { Payload } = await sendCommand(lambdaInvokeCommand, lambdaClient)

  return Buffer.from(Payload).toString()
}