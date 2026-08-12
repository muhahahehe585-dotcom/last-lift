import { Route, Switch } from 'wouter';
import { EmailGate } from './components/EmailGate';
import { GamePage } from './pages/GamePage';
import { NotFoundPage } from './pages/NotFoundPage';

function ProtectedGamePage() {
  return (
    <EmailGate>
      <GamePage />
    </EmailGate>
  );
}

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={ProtectedGamePage} />
      <Route path="/game" component={ProtectedGamePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
