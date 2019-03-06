# react-express-auth

This repository is an example of how to implement token authentication with create-react-app and an express back-end.

the steps are as follows:
- clone the repository
- run `npm install && npm start` in both the front-end and back-end folders
- open `http://localhost:3000` in your browser.
- login with the credentials username: `shrek`, password: `changeisgood`
- Open your browser's console, and view the `Application` tab to see the token.
- you can also refresh the page to see the state changes

optional:
- close your browser and stop the front-end app
- start up the front-end app again and navigate to `http://localhost:3000`

notice how the application is different from the first time you loaded up

## Prerequisites
- Node JS + NPM
- Create React App
- Nodemon (globally installed)

## Front-end implementation

Conceptually, we need to fetch a token from the back-end and save it in our localstorage in the browser. In order to do this we need to get access to our cookies inside of React. The easy way to do this is to use the `<CookieParser>` react component. 

In order to do this we need to import the Cookie parser package and wrap our application in it. 

`npm install react-cookie`

```javascript
// /front-end/index.js

import { CookiesProvider } from 'react-cookie';
import App from './App';
...
ReactDOM.render(
    <CookiesProvider>
        <App />
    </CookiesProvider>, 
    document.getElementById('root')
);
...
```
Then inside of App, were going to use the `withCookies` higher order function to pass the `cookies` prop to our component! This is done simply by passing the 
```javascript
import React, { Component } from 'react';
import { withCookies } from 'react-cookie'; // 1. import withCookies
import './App.css';

class App extends Component {
  state = {
    name: '',
    savedToken: false
  }

  render() {
    ...
  }
}

export default withCookies(App); // 2. withCookies adds the 'cookies' prop

```

now your App component will receive a prop called `cookies` with several methods on it. You can view those methods in the [react-cookie docs](https://github.com/reactivestack/cookies/tree/9ef292c706eaeb3baf6f6e60189f2105c8d6f0b0/packages/react-cookie)

Inside of our App component we're going to check the local storage for the token!
```javascript
// App.js

class App extends Component {
...
    componentDidMount() {
        // use the cookie prop to check for token
        const token = this.props.cookies.get('jwt') || '' 
        if (token) {
        const config = {
            headers: {
                authorization: token
            }
        }
        // post request with our token
        axios.get(api('/user/settings'), config)
            .then(response => {
            // update our state to acknowledge that we have a token
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
  ...
}
```

Once we're checking for the presence of our token we can create the login form to actually perform our login action.
```javascript
// App.js

class App extends Component {
...
    sendCredentials = (event) => {
        event.preventDefault();

        // make the request with the form data
        const body = {
            username: event.target.username.value,
            password: event.target.password.value
        }
        axios.post(api('/login'), body)
        .then(response => {
            // set our cookies in the response!
            this.props.cookies.set('jwt', response.data.token);
        })
        .catch(error => {
            console.log(error);
        });

        // reset the form
        event.target.reset();
    }

    render () {
        ...
    }
}
```

now in our `render()` we can detect changes based on our login.
```jsx
// App.js

class App extends Component {
    ...render() {
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
```
notice that we're using `this.state.savedToken` to check for the presence of a token. In a real app you would most likely want to redirect the user to your login page which is going to be on a different route. I decided to keep the `react-router` away from this example to keep it as simple as possible.

***
## Back-end implementation

Conceptually, we want a route to handle the login function, which will create a token and send it to the client. We're also going to need a middleware function that will decode the token and verify the token in the request. 

First we're going to need some users that we can authenticate. These users have been wrapped in classes to simulate coming from a database such as mongo or mysql. You can see the implementation in `/back-end/models/user.js` and the list of data in `/back-end/data/users.js`

Next we're going to need some routes to respond to our requests.

Let's make our login route.
```javascript
// /routes/login.js

const router = require('express').Router();
const Token = require('../utils/token');
const users = require('../data/users');

/**
 * route handler for login.
 * this checks the username/password combination 
 */
const login = (req, res) => {
    // get the username and password from the body
    const { username, password } = req.body;
    if (!req.body && !username && !password) {
        // if they don't exist, response with an error
        res.status(400).json({
            message: `you need to have a username and password in your request`
        });
    }
    
    // search for the user
    const foundUser = users.find(user => user.match(username, password));
    if (!foundUser) {
        // if no one is found, the password / username is incorrect
        res.status(400).json({
            message: `this username and password combination doesn't exist`
        });
    }

    // if we've made it this far
    // the username/password combination is correct and exists
    res.status(202).json({
        token: Token.create(foundUser)
    });
}

router.post('/', login);

module.exports = router;
```

That route on it's own is not particularly useful, since what we really need is the ability to authenticate on a per-route (or per-router) basis. Let's make a second router to handle a request that is going to only respond to authenticated requests.

```javascript
// /routes/user.js

const router = require('express').Router();
const Token = require('../utils/token');

router.get('/settings', (req, res) => {
    res.json(res.locals.user);  // should be undefined
});

module.exports = router;
```

if you are following along and have made this route you will probably notice that this route is not protected at all, anyone can make requests to this route and it should respond to all good requests. 

what we need is some middleware to block unauthenticated requests to this route.
```javascript
// /middleware/token.js

const Token = require('../utils/token');
const secret = require('../utils/secret');

// This handler will check for, and validate, a token on the authorization header
module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    // if there is no token, reject
    if (!authorization) {
        res.status(401).json({
            message: 'you are not logged in'
        })
    }

    // validate the token, and save it to locals
    res.locals.user = Token.verify(authorization, () => {
        res.status(401).json({
            message: 'unable to validate identity'
        });
    });
    // move on if we're all good.
    next();
}
```

Now let's use that middleware in the route!
```javascript
// /routes/user.js

const router = require('express').Router();
const Token = require('../utils/token');
const isAuthenticated = require('../middleware/token'); +

router.use(isAuthenticated); +

router.get('/settings', (req, res) => {
    res.json(res.locals.user); +
});

module.exports = router;
```