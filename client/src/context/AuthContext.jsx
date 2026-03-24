import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem('adminAuth') === 'true'
    );
    const navigate = useNavigate();

    const login = (username, password) => {
        const validUser = import.meta.env.VITE_ADMIN_USERNAME;
        const validPass = import.meta.env.VITE_ADMIN_PASSWORD;

        if (username === validUser && password === validPass) {
            localStorage.setItem('adminAuth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        navigate('/admin/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
