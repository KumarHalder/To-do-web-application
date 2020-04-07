import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
//import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //const itemForDeletion = JSON.parse(event.body);
  const delTodoId = event.pathParameters.todoId;

  var params = {
    TableName:todoTable,
    Key: {
      "id": delTodoId
      
    }
};
console.log("Attempting a conditional delete...");
await docClient.delete(params, function(err) {
    
    if (err) {
        return {
          statusCode:404,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: 'Unable to delete' 
        }
    }
   
      
    
}).promise();

return {
  statusCode:201,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(params) 
}
  
}

