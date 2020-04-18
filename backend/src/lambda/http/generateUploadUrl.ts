import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid';
import { getUserId } from '../utils';

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todoTable = process.env.TODO_TABLE
const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const itemExist = await groupExists(todoId,userId);
  const validGroupId = itemExist[0];
  
  

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }
  
  const item =  itemExist[1];
  //console.log('to do item', item)
  const imageId = uuidv4()
  const newItem = await createImage(userId, todoId, imageId, item)
  
  const url = getUploadUrl(imageId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true

    },
    body: JSON.stringify({
      newItem: newItem,
      uploadUrl: url
    })
  }
}

async function groupExists(todoid: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todoTable,
      Key: {
        userId: userId,
        todoId: todoid
      }
    })
    .promise()

  console.log('Get group: ', result)
  return [!!result.Item, JSON.stringify(result)]
}

async function createImage(userId: string, todoId: string, imageId: string, item: any) {
  const timestamp = new Date().toISOString()
  const newImage = JSON.parse(item)

  const newItem = {
    userId,
    todoId,
    timestamp,
    imageId,
    ...newImage,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  }
  console.log('Storing new item: ', newItem)

  await docClient
    .put({
      TableName: imagesTable,
      Item: newItem
    })
    .promise()

  return newItem
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
