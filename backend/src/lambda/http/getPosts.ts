import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getPosts, getFollowing } from '../../businessLogic/post'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getPosts')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  let posts = await getPosts(userId)

  const following = await getFollowing(userId)
  for (let user of following) {
    posts = posts.concat(await getPosts(user.userId))
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: posts
    })
  }
}
