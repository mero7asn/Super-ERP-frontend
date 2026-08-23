import { createContext, useContext, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  login as loginThunk,
  logout as logoutAction,
  updateCurrentUser as updateCurrentUserAction,
  setBusinessModel as setBusinessModelAction,
  clearError as clearErrorAction,
} from '../store/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const authState = useAuth();
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const login = (email, password) => dispatch(loginThunk(email, password));
  const logout = () => dispatch(logoutAction());
  const updateCurrentUser = (updatedData) => dispatch(updateCurrentUserAction(updatedData));
  const setBusinessModel = (businessModel, onboarded = true) =>
    dispatch(setBusinessModelAction({ businessModel, onboarded }));
  const clearError = () => dispatch(clearErrorAction());

  return useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    updateCurrentUser,
    setBusinessModel,
    clearError,
  }), [user, loading, error, dispatch]);
};

export default AuthContext;
