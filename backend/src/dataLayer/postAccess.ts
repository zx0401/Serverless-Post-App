import { FollowingItem } from './../models/FollowingItem';
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { PostItem } from '../models/PostItem'
import { UserInfo } from '../models/UserInfo'

export class PostAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly postTable = process.env.POSTS_TABLE,
    private readonly userTable = process.env.USERS_TABLE,
    private readonly followingTable = process.env.FOLLOWING_TABLE,
    private readonly followerIndex = process.env.FOLLOWER_INDEX,
    private readonly bucketName = process.env.POSTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  async createPost(post: PostItem): Promise<PostItem> {
    await this.docClient.put({
      TableName: this.postTable,
      Item: post
    }).promise()

    return post
  }

  async getPost(postId: string, userId: string): Promise<PostItem> {
    const result = await this.docClient.get({
      TableName: this.postTable,
        Key: {
          "userId": userId,
          "postId": postId
        }
    }).promise()
  
    return result.Item as PostItem
  }

  async getPosts(userId: string): Promise<PostItem[]> {
    const result = await this.docClient.query({
      TableName: this.postTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    return result.Items as PostItem[]
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.postTable,
        Key: {
          "userId": userId,
          "postId": postId
        }
    }).promise()
  }

  async updateUser(userInfo: UserInfo): Promise<void> {
    await this.docClient.put({
      TableName: this.userTable,
      Item: userInfo
    }).promise()
  }

  async getUser(userId: string): Promise<UserInfo> {
    const result = await this.docClient.get({
      TableName: this.userTable,
        Key: {
          "userId": userId
        }
    }).promise()
  
    return result.Item as UserInfo
  }

  async getFollowing(userId: string): Promise<FollowingItem[]> {
    const result = await this.docClient.query({
      TableName: this.followingTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
  
    return result.Items as FollowingItem[]
  }

  async getFollowers(userId: string): Promise<FollowingItem[]> {
    const result = await this.docClient.query({
      TableName: this.followingTable,
      IndexName : this.followerIndex,
      KeyConditionExpression: 'followingId = :followingId',
      ExpressionAttributeValues: {
        ':followingId': userId
      }
    }).promise()
  
    return result.Items as FollowingItem[]
  }

  async addFollowing(followingItem: FollowingItem): Promise<void> {
    await this.docClient.put({
      TableName: this.followingTable,
      Item: followingItem
    }).promise()
  }

  async deleteFollowing(userId: string, followingId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.followingTable,
        Key: {
          "userId": userId,
          "followingId": followingId
        }
    }).promise()
  }

  async generateUploadUrl(postId: string, userId: string): Promise<string> {
    const uploadUrl = `https://${this.bucketName}.s3.amazonaws.com/${postId}`
  
    await this.docClient.update({
      TableName: this.postTable,
        Key: {
          "userId": userId,
          "postId": postId
        },
        UpdateExpression: "set attachmentUrl= :attachmentUrl",
        ExpressionAttributeValues:{
          ":attachmentUrl": uploadUrl
        }
    }).promise()

    return this.getUploadUrl(postId)
  }

  private getUploadUrl(postId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: postId,
      Expires: this.urlExpiration
    })
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}