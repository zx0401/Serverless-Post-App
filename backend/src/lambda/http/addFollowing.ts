import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUser, addFollowing } from '../../businessLogic/post'
import { getUserId } from '../utils'

const logger = createLogger('addFollowing')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const followingId = decodeURI(event.pathParameters.followingId)

  if (userId == followingId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Cannot follow yourself!'
      })
    }
  }

  const followingUser = await getUser(followingId)
  if (!followingUser) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'The following user does not exist'
      })
    }
  }

  await addFollowing(userId, followingId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      user: followingUser
    })
  }
}