# Serverless post content app

This application will allow user to post messages, follow and unfollow others. Each post can optionally have an attachment image.

# The following Functions have been implemented

To implement this project, you need to implement the following functions and configure them in the `serverless.yml` file:

* `Auth` - this function should implement a custom authorizer for API Gateway that should be added to all other functions.

* `GetPosts` - should return all posts for a current user and the users he's following. A user id can be extracted from a JWT token that is sent by the frontend

It should return data that looks like this:

```json
{
  "items": [
    {
      "postId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "content": "Buy milk",
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "postId": "456",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "content": "Send a letter",
      "attachmentUrl": "http://example.com/image.png"
    },
  ]
}
```

* `CreatePost` - should create a new post for a current user. A shape of data send by a client application to this function can be found in the `CreatePostRequest.ts` file

It receives a new post item to be created in JSON format that looks like this:

```json
{
  "content": "2019-07-27T20:01:45.424Z"
}
```

It should return a new post item that looks like this:

```json
{
  "item": {
    "postId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "content": "Buy milk",
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

* `DeletePost` - should delete a post item created by a current user. Expects an id of a post item to remove.

It should return an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a post item.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

* `GetPost` - should return a post for a current user.

It should return a JSON object that looks like this:

```json
{
  "item": {
    "postId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "content": "Buy milk",
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

* `GetFollowing` - should return all the users the current user is following

It should return a JSON object that looks like this:

```json
{
  "items": [
    {
      "userId": "123",
      "lastLogin": "2019-07-27T20:01:45.424Z"
    },
    {
      "userId": "456",
      "lastLogin": "2019-07-27T20:01:45.424Z"
    },
  ]
}
```

* `GetFollowers` - should return all the users that are following the current user

It should return a JSON object that looks like this:

```json
{
  "items": [
    {
      "userId": "123",
      "lastLogin": "2019-07-27T20:01:45.424Z"
    },
    {
      "userId": "456",
      "lastLogin": "2019-07-27T20:01:45.424Z"
    },
  ]
}
```

* `AddFollowing` - should add a new user to follow for the current user

It should return a JSON object that looks like this:

```json
{
  "user": {
      "userId": "123",
      "lastLogin": "2019-07-27T20:01:45.424Z"
    }
}
```

* `DeleteFollowing` - should delete a user to follow for the current user

It should return an empty body.


* `UpdateUserLastLogin` - should upload the user last login time. A user must login at least once so that can be followed by others.

It should return an empty body.


All functions are already connected to appropriate events from API Gateway.

An id of a user can be extracted from a JWT token passed by a client.

You also need to add any necessary resources to the `resources` section of the `serverless.yml` file such as DynamoDB table and S3 bucket.


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless post content application.
