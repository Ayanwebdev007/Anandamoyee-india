import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductList from './pages/ProductList';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    {/* Add more routes here as we build them */}
                </Routes>

                {/* Simple Footer Placeholder */}
                <footer className="bg-gray-900 text-white py-8 mt-12">
                    <div className="container mx-auto px-4 text-center">
                        <p>&copy; 2024 Anandamoyee India (Millex). All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
