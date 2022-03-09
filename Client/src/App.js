import './App.css';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { Navbar } from "./Shared Components/Navbar/Navbar"
import { Home } from "./Components/Home/Home"
import { Authenticate } from "./Components/AuthenticateUser/Authenticate"
import { Activate } from "./Components/ActivateUser/Activate"
import { Rooms } from "./Components/Rooms/Rooms"
import { useSelector } from "react-redux"
import { useLoading } from "./hooks/useLoading"
import { Loader } from './Shared Components/Loader/Loader';
import { Chat } from './Components/Chat/Chat';
import { GrpChat } from './Components/Grp_chat/GrpChat'
import { GrpSettings } from './Components/GrpSettings/GrpSettings';

function App() {

  const { loading } = useLoading();

  return loading ? (
    <Loader message="Loading! please wait...." />
  ) : (
    <BrowserRouter>
      <Switch>
        <Guest path="/" exact>
          <Navbar />
          <Home />
        </Guest>
        <Guest path="/authenticate">
          <Navbar />
          <Authenticate />
        </Guest>
        <SemiProtected path="/activate">
          <Navbar />
          <Activate />
        </SemiProtected>
        <Protected path="/rooms">
          <Navbar />
          <Rooms dm={false} />
        </Protected>
        <Protected path="/dms">
          <Navbar />
          <Rooms dm={true} />
        </Protected>
        <Protected path="/chat/:id">
          <Chat />
        </Protected>
        <Protected path="/grp/:id">
          <GrpChat />
        </Protected>
        <Protected path="/settings/:id">
          <GrpSettings />
        </Protected>
      </Switch>
    </BrowserRouter>
  );
}

const Guest = (props) => {
  const { isAuth } = useSelector((state) => state.user)
  return (
    <Route
      {...props.rest}
      render={({ location }) => {
        return isAuth ? (
          <Redirect
            to={{
              pathname: '/rooms',
              state: { from: location },
            }}
          />
        ) : (
          props.children
        );
      }}
    ></Route>
  );
};

const SemiProtected = (props) => {
  const { user, isAuth } = useSelector((state) => state.user)
  return (
    <Route
      {...props.rest}
      render={({ location }) => {
        return !isAuth ? (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location },
            }}
          />
        ) : isAuth && !user.activated ? (
          props.children
        ) : (
          <Redirect
            to={{
              pathname: '/rooms',
              state: { from: location },
            }}
          />
        );
      }}
    ></Route>
  );
};

const Protected = (props) => {
  const { user, isAuth } = useSelector((state) => state.user)
  return (
    <Route
      {...props.rest}
      render={({ location }) => {
        return !isAuth ? (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location },
            }}
          />
        ) : isAuth && !user.activated ? (
          <Redirect
            to={{
              pathname: '/activate',
              state: { from: location },
            }}
          />
        ) : (
          props.children
        );
      }}
    ></Route>
  );
};

export default App;