import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { updateTodo } from '../../businessLogic/todo'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const updatedTodo = updateTodo(event)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode:201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: 'Updated' + JSON.stringify(updatedTodo) 
  }
}

