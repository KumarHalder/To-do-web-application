import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuidv4 } from 'uuid';
import {getUserId} from '../utils'
const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  var date = new Date()
  var currentTime = date.toISOString();
  //var currentTime = date.getHours() + ":" + date.getMinutes()+"::" + date.getDate() +"/" +date.getMonth() +"/"+ date.getFullYear()
  const itemId = uuidv4()

  const parsedBody = JSON.parse(event.body)
  const userID = getUserId(event);

  const newTodo: CreateTodoRequest = 
  {
    userId: userID,
    todoId: itemId,
    "createdAt": currentTime,
    ...parsedBody
  }
  
  await docClient.put({
    TableName: todoTable,
    Item: newTodo
  }).promise()
  

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item : newTodo
    })
  }
}
