import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Grid,
  Header,
  Icon,
  Loader,
  Modal,
  Form,
  ButtonProps
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import { UserInfo } from '../types/UserInfo'
import { addFollowing, deleteFollowing, getFollowing } from '../api/following-api'

interface FollowingProps {
  auth: Auth
  history: History
}

interface FollowingState {
  following: UserInfo[]
  loadingFollowing: boolean,
  userId: string,
  model_open: boolean
}

export class Following extends React.PureComponent<FollowingProps, FollowingState> {
  state: FollowingState = {
    following: [],
    loadingFollowing: true,
    userId: '',
    model_open: false
  }

  handleAddFollowingSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    let followingUser: UserInfo
    try {
      followingUser = await addFollowing(this.props.auth.getIdToken(), this.state.userId)
    } catch {
      alert('Failed to add the user to follow')

      this.setState({
        following: [...this.state.following],
        model_open: false
      })

      return
    }

    this.setState({
      following: [followingUser, ...this.state.following],
      model_open: false
    })
  }

  handleFollowingUserIdChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      following: [...this.state.following],
      userId: event.currentTarget.value,
      model_open: this.state.model_open
    })
  }

  handleModalOpen = (vent: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    this.setState({ following: [...this.state.following], model_open: true })
  }

  handleModalCancel = (vent: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    this.setState({ following: [...this.state.following], model_open: false })
  }

  onFollowingDelete = async (followingId: string) => {
    try {
      await deleteFollowing(this.props.auth.getIdToken(), followingId)
      this.setState({
        following: this.state.following.filter(user => user.userId != followingId)
      })
    } catch {
      alert('Following user deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const following = await getFollowing(this.props.auth.getIdToken())
      this.setState({
        following: following,
        loadingFollowing: false
      })
    } catch (e) {
      alert(`Failed to fetch following: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Welcome, {this.props.auth.getUserId()}</Header>

        {this.renderAddFollowingModal()}

        {this.renderFollowing()}
      </div>
    )
  }

  renderAddFollowingModal() {
    return (
      <Modal open={this.state.model_open} trigger={<Button onClick={this.handleModalOpen.bind(this)} color='teal' icon labelPosition='left'><Icon name='add' />Add Following</Button>}>
        <Modal.Header>Add Following</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleAddFollowingSubmit} >
            <Form.Field>
              <input
                placeholder="User id to follow..." 
                onChange={this.handleFollowingUserIdChange} />
            </Form.Field>
            <div>
              <Button color='black' type="reset" onClick={this.handleModalCancel.bind(this)}>Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content="Add"
                type="submit"/>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }

  renderFollowing() {
    if (this.state.loadingFollowing) {
      return this.renderLoading()
    }

    return this.renderFollowingList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading following
        </Loader>
      </Grid.Row>
    )
  }

  renderFollowingList() {
    return (
      <Grid padded>
        {this.state.following.map((following, pos) => {
          return (
            <Grid.Row key={following.userId}>
              <Grid.Column width={5} verticalAlign="middle">
                {following.userId}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {following.lastLogin}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onFollowingDelete(following.userId)} >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
