import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {  TodoItem } from '../models/TodoItem'
//import {APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils';
import { TodoUpdate } from '../models/TodoUpdate';
import { APIGatewayProxyEvent} from 'aws-lambda'

export class TodoAccess
{
    constructor(
        private readonly docClient: DocumentClient =  new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE
    ){
    }

    async getAllToDos(event: APIGatewayProxyEvent): Promise<TodoItem[]>{
        //console.log("getting all todos", event);
        console.log("userID",getUserId(event))
        // const result = await this.docClient.query({
        //     TableName: this.todoTable,
        //     //IndexName: 'index-name',
        //     KeyConditionExpression: 'userId = :paritionKey',
        //     ExpressionAttributeValues: {
        //         ':paritionKey': getUserId(event)

        //     }
        // }).promise();

        const result = await this.docClient.scan({
            TableName: this.todoTable
        }).promise();
        const items = result.Items;
        console.log(items)
        return items as TodoItem[];
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
          TableName: this.todoTable,
          Item: todoItem
        }).promise()
        console.log("item",todoItem)
        return todoItem
      }
    
    async updateTodo(updatedTodo: TodoUpdate, userId:string,todoId:string): Promise<TodoUpdate>{


        var params = {
            TableName:this.todoTable,
            Key:{
            "userId": userId,
            "todoId": todoId
            
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

        await this.docClient.update(params, function(err, data) {
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

        return updatedTodo

    }

     

}


