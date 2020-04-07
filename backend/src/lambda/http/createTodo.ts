import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  var date = new Date()
  var timestamp = date.getTime();
  var currentTime = date.getHours() + ":" + date.getMinutes()+"::" + date.getDate() +"/" +date.getMonth() +"/"+ date.getFullYear()
  
  const newTodo: CreateTodoRequest = 
  {
    "id": timestamp.toString(),
    "timestamp": currentTime.toString(),
    ...JSON.parse(event.body)
  }
  
  await docClient.put({
    TableName: todoTable,
    Item: newTodo
  }).promise()
  

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newTodo
    })
  }
}
