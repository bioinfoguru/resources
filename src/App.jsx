import { Router, Route } from '@solidjs/router';
import Header from './components/Header';
import Footer from './components/Footer';
import index from './pages';
import DockingTools from './pages/docking-tools/index';
import Ebooks from './pages/ebooks/index';
import Games from './pages/games/index';
import AlignmentTools from './pages/alignment-tools/index';
import msa_dia from './pages/alignment-tools/msa_dia';
import ss_dia from './pages/alignment-tools/ss_dia';
import msa_dia_help from './pages/alignment-tools/msa_dia_help';

const Layout = (props) => (
  <div class="flex flex-col min-h-screen">
    <Header />
  <main class="flex-1 flex flex-col">
  {props.children}
    </main>
    {/* Footer Rendered banner removed */}
    <Footer />
  </div>
);

function App() {
  return (
    <Router root={Layout} base={import.meta.env.SERVER_BASE_URL}>
  <Route path="/" component={index} />
      <Route path="/docking-tools" component={DockingTools} />
      <Route path="/ebooks" component={Ebooks} />
      <Route path="/games" component={Games} />
      <Route path="/alignment-tools" component={AlignmentTools} />
      <Route path="/alignment-tools/ss-dia" component={ss_dia} />
      <Route path="/alignment-tools/msa_dia" component={msa_dia} />
      <Route path="/alignment-tools/msa_dia_help" component={msa_dia_help} />
    </Router>
  );
}
export default App;
