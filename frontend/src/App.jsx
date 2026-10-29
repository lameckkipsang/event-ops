import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<div className="text-center py-10 font-bold text-xl">Welcome to EventOps</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;