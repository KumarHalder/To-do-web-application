import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'


import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updatedTodo:UpdateTodoRequest = JSON.parse(event.body);


  var params = {
    TableName:todoTable,
    Key:{
      "id": todoId
      
    },
    UpdateExpression: "set #name_todo = :n,#dueDate_todo = :dd,#done_todo = :dn",
    ExpressionAttributeValues:{
        ":n": updatedTodo.name.toString(),
        ":dd": updatedTodo.dueDate.toString(),
        ":dn": "true"===updatedTodo.done.toString()
    },
    ExpressionAttributeNames:{
      "#name_todo": "name",
      "#dueDate_todo": "dueDate",
      "#done_todo": "done"

    },
    ReturnValues:"UPDATED_NEW"
};

await docClient.update(params, function(err, data) {
  if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      return {
        statusCode:404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: 'Unable to delete' 

      }
  } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
  }
}).promise();
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode:201,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: 'Updated' + JSON.stringify(updatedTodo) 
  }
}

