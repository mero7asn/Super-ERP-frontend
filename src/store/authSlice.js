import { createSlice } from '@reduxjs/toolkit';
import API from '../services/api';

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem('crmUser')) || null;
  } catch {
    return null;
  }
};

const initialState = {
  user: loadUser(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.loading = true;
      state.error = null;
    },
    authSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.user = action.payload;
    },
    authFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem('crmUser');
    },
    updateCurrentUser(state, action) {
      state.user = state.user ? { ...state.user, ...action.payload } : action.payload;
      if (state.user) {
        localStorage.setItem('crmUser', JSON.stringify(state.user));
      }
    },
    setBusinessModel(state, action) {
      const { businessModel, onboarded = true } = action.payload || {};
      state.user = state.user ? { ...state.user, businessModel, onboarded } : { businessModel, onboarded };
      localStorage.setItem('crmUser', JSON.stringify(state.user));
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  updateCurrentUser,
  setBusinessModel,
  clearError,
} = authSlice.actions;

// Async Thunks
export const login = (email, password) => async (dispatch) => {
  dispatch(authStart());
  try {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('crmUser', JSON.stringify(data));
    dispatch(authSuccess(data));
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed';
    dispatch(authFailure(msg));
    throw new Error(msg, { cause: err });
  }
};

export default authSlice.reducer;
