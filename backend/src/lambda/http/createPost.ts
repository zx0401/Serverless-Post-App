import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreatePostRequest } from '../../requests/CreatePostRequest'
import { createLogger } from '../../utils/logger'
import { createPost } from '../../businessLogic/post'
import { getUserId } from '../utils'

const logger = createLogger('createPost')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const newPost: CreatePostRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  const newItem = await createPost(newPost, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
