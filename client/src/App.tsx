import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment, Input } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Posts } from './components/Posts'
import { Following } from './components/Following'
import { Followers } from './components/Followers'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {
  activeItem: string,
  searchedUser: string
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.state = { activeItem: "home", searchedUser: '' }
    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)

    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  handleItemClick (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, { name }: any) {
    this.setState({ activeItem: name, searchedUser: this.state.searchedUser })
  }

  handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      this.props.history.push(`/users?username=${event.currentTarget.value}`)
    }

    console.log(event.currentTarget.value)
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ searchedUser: event.currentTarget.value, activeItem: this.state.activeItem });
  }

  generateMenu() {
    const { activeItem, searchedUser } = this.state;
    return (
      <Menu>
        <Menu.Item name="home" active={activeItem === 'home'} onClick={this.handleItemClick}>
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Item name="following" active={activeItem === 'following'} onClick={this.handleItemClick}>
          <Link to="/following">Following</Link>
        </Menu.Item>

        <Menu.Item name="followers" active={activeItem === 'followers'} onClick={this.handleItemClick}>
          <Link to="/followers">Followers</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Posts {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/following"
          exact
          render={props => {
            return <Following {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/followers"
          exact
          render={props => {
            return <Followers {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
