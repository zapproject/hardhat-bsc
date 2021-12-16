import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import GlobalStyle from './styles/global';

const Home = lazy(() => import('./Pages/Home'));
const About = lazy(() => import('./Pages/About'));

const App = () => (
  <Router>
    <GlobalStyle />
    <Header />
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/about" component={About} />
      </Switch>
    </Suspense>
  </Router>
);

export default App;
