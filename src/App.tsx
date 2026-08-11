import { Route, Switch } from 'wouter';
import { GamePage } from './pages/GamePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={GamePage} />
      <Route path="/game" component={GamePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
