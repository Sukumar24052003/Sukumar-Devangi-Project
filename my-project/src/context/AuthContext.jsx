// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [auth, setAuth] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedToken = localStorage.getItem('accessToken');
//     if (storedToken) {
//       setAuth({ token: storedToken });
//     }
//   }, []);

//   const logout = () => {
//     localStorage.removeItem('accessToken');
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ auth, setAuth, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const navigate = useNavigate();

  // Ensure navigate stays stable
  const stableNavigate = useCallback(navigate, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');
    const storedUserid = localStorage.getItem('userId');
    
    if (storedToken && storedName && storedRole) {
      setAuth({ token: storedToken, userName: storedName, role: storedRole,userId:storedUserid });
    } else {
      setAuth(null); // User is not authenticated
    }

    setLoading(false); // Done loading
  }, []);

  useEffect(() => {
    if (auth) {
      stableNavigate('/home');  // Redirect immediately when auth state changes
    }
  }, [auth, stableNavigate]);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setAuth(null);
    stableNavigate('/login');
  };

  if (loading) return <div>Loading...</div>; // Show loading screen until auth state is ready

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



