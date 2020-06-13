import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Modal,
  Form,
  TextArea,
  TextAreaProps,
  ButtonProps
} from 'semantic-ui-react'

import { getUploadUrl, uploadFile, createPost, deletePost, getPosts, getPost } from '../api/posts-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  posts: Post[]
  loadingPosts: boolean,
  file: any,
  content: string,
  model_open: boolean
}

export class Posts extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    posts: [],
    loadingPosts: true,
    file:  undefined,
    content: '',
    model_open: false
  }

  handlePostSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    let newPost = await this.createNewPost()

    if (!newPost) {
      this.setState({
        posts: [...this.state.posts],
        model_open: false
      })

      return
    }
      
    if (this.state.file) {
      try {
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newPost.postId)
  
        await uploadFile(uploadUrl, this.state.file)

        newPost = await getPost(this.props.auth.getIdToken(), newPost.postId)
  
      } catch (e) {
        alert('Could not upload a file: ' + e.message)
      }
    }

    this.setState({
      posts: [newPost, ...this.state.posts],
      model_open: false
    })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      posts: [...this.state.posts],
      content: this.state.content,
      model_open: this.state.model_open,
      file: files[0]
    })
  }

  handlePostContentChange = (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    this.setState({
      posts: [...this.state.posts],
      content: event.currentTarget.value,
      model_open: this.state.model_open,
      file: this.state.file
    })
  }

  handleModalOpen = (vent: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    this.setState({ posts: [...this.state.posts], model_open: true })
  }

  handleModalCancel = (vent: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    this.setState({ posts: [...this.state.posts], model_open: false })
  }

  createNewPost = async () => {
    try {
      const newPost = await createPost(this.props.auth.getIdToken(), {
        content: this.state.content
      })
      
      return newPost
    } catch {
      alert('Post creation failed')
    }

    return null
  }

  onPostDelete = async (postId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), postId)
      this.setState({
        posts: this.state.posts.filter(post => post.postId != postId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const posts = await getPosts(this.props.auth.getIdToken())
      this.setState({
        posts,
        loadingPosts: false
      })
    } catch (e) {
      alert(`Failed to fetch posts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Welcome, {this.props.auth.getUserId()}</Header>

        {this.renderNewPostModal()}

        {this.renderPosts()}
      </div>
    )
  }

  renderNewPostModal() {
    return (
      <Modal open={this.state.model_open} trigger={<Button onClick={this.handleModalOpen.bind(this)} color='teal' icon labelPosition='left'><Icon name='add' />Create Post</Button>}>
        <Modal.Header>Create Post</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handlePostSubmit} >
            <TextArea
              placeholder="What's on your mind..." 
              onChange={this.handlePostContentChange} />
            <Form.Field>
              <label>Add Photo</label>
              <input
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>
            <div>
              <Button color='black' type="reset" onClick={this.handleModalCancel.bind(this)}>Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content="Post"
                type="submit"/>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }

  renderPosts() {
    if (this.state.loadingPosts) {
      return this.renderLoading()
    }

    return this.renderPostsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Posts
        </Loader>
      </Grid.Row>
    )
  }

  renderPostsList() {
    return (
      <Grid padded>
        {this.state.posts.map((post, pos) => {
          return (
            <Grid.Row key={post.postId}>
              <Grid.Column width={8} verticalAlign="middle">
                {post.content}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {post.createdAt}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {this.props.auth.getUserId()}
              </Grid.Column>
              { post.userId == this.props.auth.getUserId() ? 
              (<Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPostDelete(post.postId)} >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>) : (<Grid.Column width={1} floated="right"/>) }
              
              {post.attachmentUrl && (
                <Image src={post.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
