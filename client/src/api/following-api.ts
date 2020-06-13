import { apiEndpoint } from '../config'
import { Post } from '../types/Post';
import { CreatePostRequest } from '../types/CreatePostRequest';
import Axios from 'axios'
import { UserInfo } from '../types/UserInfo';

export async function getFollowing(idToken: string): Promise<UserInfo[]> {
  console.log('Fetching following')

  const response = await Axios.get(`${apiEndpoint}/following`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Following:', response.data)
  return response.data.items
}

export async function getFollowers(idToken: string): Promise<UserInfo[]> {
  console.log('Fetching followers')

  const response = await Axios.get(`${apiEndpoint}/followers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Followers:', response.data)
  return response.data.items
}

export async function addFollowing(
  idToken: string,
  followingId: string
): Promise<UserInfo> {
  const response = await Axios.post(`${apiEndpoint}/following/${followingId}`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.user
}

export async function deleteFollowing(
  idToken: string,
  followingId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/following/${followingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}
