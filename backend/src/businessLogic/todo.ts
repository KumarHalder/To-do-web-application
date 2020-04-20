import { v4 as uuidv4 } from 'uuid'
import {TodoItem} from '../models/TodoItem'
import {getUserId} from '../lambda/utils'
import {TodoAccess} from '../dataLayer/todoAccess'
import { APIGatewayProxyEvent} from 'aws-lambda'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllGroups(event:APIGatewayProxyEvent): Promise<TodoItem[]>{
 return todoAccess.getAllToDos(event);
}

export async function createTodo(
    event: APIGatewayProxyEvent
  ): Promise<TodoItem> {
   console.log("... received event",event)
    const itemId = uuidv4()
    const userId = getUserId(event)
    const date = new Date()
    const parseBody = JSON.parse(event.body)
    const todoItemNew: TodoItem = {
        todoId : itemId,
        userId: userId,
        createdAt: date.toISOString(),
        dueDate: parseBody.dueDate,
        done: false,
        name : parseBody.name
    }
    console.log(todoItemNew)
    return await todoAccess.createTodo(todoItemNew);
  }

export async function updateTodo(event:APIGatewayProxyEvent){
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    const updatedTodo:UpdateTodoRequest = JSON.parse(event.body);

    return await todoAccess.updateTodo(updatedTodo,userId,todoId);
}
