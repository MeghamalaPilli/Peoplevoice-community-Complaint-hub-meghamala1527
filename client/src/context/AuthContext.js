import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (token && savedUser && savedUser !== "undefined" && savedUser !== "null") {
    try {
      setUser(JSON.parse(savedUser));

      API.get("/auth/me")
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
    }
  } else {
    setLoading(false);
  }
}, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

const register = async (data) => {
  const res = await API.post('/auth/register', data);

  // President registration doesn't return token/user
  if (data.role === "president") {
    return res.data;
  }

  // Citizen registration
  if (res.data.user && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  return res.data.user;
};

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("originalToken");
    localStorage.removeItem("impersonating");

    delete API.defaults.headers.common.Authorization;

    setUser(null);

};
const impersonateLogin = async (token) => {

    localStorage.setItem("token", token);

    API.defaults.headers.common.Authorization =
        `Bearer ${token}`;

    const res = await API.get("/auth/me");

    localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
    );

    setUser(res.data.user);

    return res.data.user;

};

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
   <AuthContext.Provider
value={{
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    impersonateLogin
}}
>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
