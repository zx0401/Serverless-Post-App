import { UserInfo } from '../models/UserInfo';
import * as uuid from 'uuid'

import { CreatePostRequest } from '../requests/CreatePostRequest'
import { PostItem } from '../models/PostItem'
import { PostAccess } from '../dataLayer/postAccess'
import { createLogger } from '../utils/logger'

const postAccess = new PostAccess()
const logger = createLogger('PostAccess')

export async function createPost(createPostRequest: CreatePostRequest, userId: string): Promise<PostItem> {
  logger.info('Creating the post for the user', { userId: userId })

  const postId = uuid.v4()

  return await postAccess.createPost({
    postId: postId,
    userId: userId,
    content: createPostRequest.content,
    createdAt: new Date().toISOString()
  })
}

export async function getPost(postId: string, userId: string): Promise<PostItem> {
  logger.info('Getting the post for the user', { postId: postId, userId: userId })

  return await postAccess.getPost(postId, userId)
}

export async function getPosts(userId: string): Promise<PostItem[]> {
  logger.info('Getting posts for the user', { userId: userId })

  return await postAccess.getPosts(userId)
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  logger.info('Deleting the post for the user', { postId: postId, userId: userId })
  
  await postAccess.deletePost(postId, userId)
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  logger.info('Updating the last login time for the user', { userId: userId })

  await postAccess.updateUser({
    userId: userId, 
    lastLogin: new Date().toISOString()
  })
}

export async function getUser(userId: string): Promise<UserInfo> {
  logger.info('Getting the user info', { userId: userId })

  return await postAccess.getUser(userId)
}

export async function getFollowing(userId: string): Promise<UserInfo[]> {
  logger.info('Getting following for the user', { userId: userId })

  const items = await postAccess.getFollowing(userId)
  const following = []

  for (let item of items) {
    following.push(await getUser(item.followingId))
  }

  return following
}

export async function getFollowers(userId: string): Promise<UserInfo[]> {
  logger.info('Getting followers for the user', { userId: userId })

  const items = await postAccess.getFollowers(userId)
  const followers = []

  for (let item of items) {
    followers.push(await getUser(item.userId))
  }

  return followers
}

export async function addFollowing(userId: string, followingId: string): Promise<void> {
  logger.info('Adding the following for the user', { userId: userId, followingId: followingId })

  return await postAccess.addFollowing({
    userId: userId,
    followingId: followingId,
    createdAt: new Date().toISOString()
  })
}

export async function deleteFollowing(userId: string, followingId: string): Promise<void> {
  logger.info('Deleting the following for the user', { userId: userId, followingId: followingId })

  return await postAccess.deleteFollowing(userId, followingId)
}

export async function generateUploadUrl(postId: string, userId: string): Promise<string> {
  logger.info('Generating the upload url for the post of the user', { postId: postId, userId: userId })
  
  return await postAccess.generateUploadUrl(postId, userId)
}