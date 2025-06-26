// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const ProtectedRoute = ({ role, children }) => {
//   const { auth } = useAuth();

//   if (!auth) {
//     return <Navigate to="/login" replace />;
//   }

//   if (role && auth.role !== role) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role, children }) => {
  const { auth, loading } = useAuth();

  if (loading) {
    // You can show a loading spinner or message here if needed
    return <div>Loading...</div>;
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }



  return children;
};

export default ProtectedRoute;
