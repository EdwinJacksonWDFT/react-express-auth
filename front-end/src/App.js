import React, { Component } from 'react';
import { withCookies } from 'react-cookie'; // 1. import withCookies
import axios from 'axios';
import './App.css';
import api from './util/api';

class App extends Component {
  state = {
    name: '',
    savedToken: false
  }

  componentDidMount() {
    const token = this.props.cookies.get('jwt') || ''  // 3. check to see if token is in cookies
    if (token) {
      const config = {
        headers: {
          authorization: token
        }
      }
      axios.get(api('/user/settings'), config)
        .then(response => {
          this.setState({
            name: response.data.username,
            savedToken: true
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  sendCredentials = (event) => {
    event.preventDefault();
    const body = {
      username: event.target.username.value,
      password: event.target.password.value
    }
    axios.post(api('/login'), body)
      .then(response => {
        this.props.cookies.set('jwt', response.data.token);
      })
      .catch(error => {
        console.log(error);
      });
    event.target.reset();
  }

  logout = (e) => {
    this.props.cookies.remove('jwt');
    this.setState({ savedToken: false });
  }

  render() {
    return (
      <div className="app">
        <h1 className="title">Token Authentication</h1>
        {
          this.state.savedToken && (
            <>
              <h2>Hello, {this.state.name}</h2>
              <button onClick={this.logout}>Logout</button>
            </>
          )
        }
        {
          !this.state.savedToken &&
          <form className="login-form" onSubmit={this.sendCredentials}>
            <input type="text" name="username" />
            <input type="password" name="password" />
            <button type="submit">Login</button>
          </form>
        }
      </div>
    );
  }
}

export default withCookies(App); // 2. withCookies adds the 'cookies' prop
