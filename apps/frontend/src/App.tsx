import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RustStylusNFTPage from './pages/RustStylusNFTPage';
import SolidityNFTPage from './pages/SolidityNFTPage';
import SolidityStylusNFTPage from './pages/SolidityStylusNFTPage';
import Layout from './components/Layout';

// Re-export contract addresses for convenience in places that grabbed
// them from App in the past.
export { CONTRACT_ADDRESSES } from './config/contracts';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<RustStylusNFTPage />} />
          <Route path="rust-stylus" element={<RustStylusNFTPage />} />
          <Route path="solidity" element={<SolidityNFTPage />} />
          <Route path="solidity-stylus" element={<SolidityStylusNFTPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
