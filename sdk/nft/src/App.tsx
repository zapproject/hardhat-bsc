import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import GlobalStyle from './styles/global';

const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));

const App = () => (
  <Router>
    <GlobalStyle />
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/about" component={About} />
      </Switch>
    </Suspense>
  </Router>
);

export default App;
