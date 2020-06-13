import { History } from 'history'
import * as React from 'react'
import {
  Grid,
  Header,
  Loader
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import { UserInfo } from '../types/UserInfo'
import { getFollowers } from '../api/following-api'

interface FollowersProps {
  auth: Auth
  history: History
}

interface FollowersState {
  followers: UserInfo[]
  loadingFollowers: boolean
}

export class Followers extends React.PureComponent<FollowersProps, FollowersState> {
  state: FollowersState = {
    followers: [],
    loadingFollowers: true
  }

  async componentDidMount() {
    try {
      const followers = await getFollowers(this.props.auth.getIdToken())
      this.setState({
        followers: followers,
        loadingFollowers: false
      })
    } catch (e) {
      alert(`Failed to fetch followers: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Welcome, {this.props.auth.getUserId()}</Header>

        {this.renderFollowers()}
      </div>
    )
  }

  renderFollowers() {
    if (this.state.loadingFollowers) {
      return this.renderLoading()
    }

    return this.renderFollowersList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading followers
        </Loader>
      </Grid.Row>
    )
  }

  renderFollowersList() {
    return (
      <Grid padded>
        {this.state.followers.map((follower, pos) => {
          return (
            <Grid.Row key={follower.userId}>
              <Grid.Column width={5} verticalAlign="middle">
                {follower.userId}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {follower.lastLogin}
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}