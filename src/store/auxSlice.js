import { createSlice } from '@reduxjs/toolkit';
import API from '../services/api';
import { updateCurrentUser } from './authSlice';

export const AUX_COLORS = {
  Live: '#10B981',
  Training: '#F59E0B',
  Break: '#6366F1',
  Coaching: '#3B82F6',
  Lunch: '#F97316',
  Other: '#64748B',
  'Logged out': '#EF4444',
};

export const AUX_ICONS = {
  Live: '🟢',
  Training: '📚',
  Break: '☕',
  Coaching: '🎯',
  Lunch: '🍽️',
  Other: '⚪',
  'Logged out': '🔴',
};

export const DEFAULT_AUXES = [
  { name: 'Break', enabled: true, timingMode: 'fixed', defaultMinutes: 15, color: '#6366F1', icon: '🟣' },
  { name: 'Lunch', enabled: true, timingMode: 'fixed', defaultMinutes: 30, color: '#F97316', icon: '🍽️' },
  { name: 'Coaching', enabled: true, timingMode: 'flexible', defaultMinutes: null, color: '#3B82F6', icon: '🔵' },
  { name: 'Training', enabled: true, timingMode: 'flexible', defaultMinutes: null, color: '#F59E0B', icon: '🟡' },
  { name: 'Other', enabled: true, timingMode: 'flexible', defaultMinutes: null, color: '#64748B', icon: '⚪' },
];

const initialState = {
  teamAux: [],
  currentAux: 'Logged out',
  statusSince: Date.now(),
  todayStats: { Live: 0, Break: 0, Lunch: 0, Training: 0, Coaching: 0, Other: 0, 'Logged out': 0 },
  myPlan: null,
  auxConfig: null,
  loading: false,
};

const auxSlice = createSlice({
  name: 'aux',
  initialState,
  reducers: {
    setTeamAux(state, action) {
      state.teamAux = action.payload || [];
    },
    setCurrentAux(state, action) {
      if (typeof action.payload === 'object' && action.payload !== null) {
        state.currentAux = action.payload.status || state.currentAux;
        if (action.payload.since) {
          state.statusSince = action.payload.since;
        }
      } else {
        state.currentAux = action.payload;
      }
    },
    setStatusSince(state, action) {
      state.statusSince = action.payload;
    },
    setTodayStats(state, action) {
      state.todayStats = action.payload;
    },
    setMyPlan(state, action) {
      state.myPlan = action.payload;
    },
    setAuxConfig(state, action) {
      state.auxConfig = action.payload;
    },
  },
});

export const {
  setTeamAux,
  setCurrentAux,
  setStatusSince,
  setTodayStats,
  setMyPlan,
  setAuxConfig,
} = auxSlice.actions;

// Async Thunks
export const fetchAuxConfig = () => async (dispatch) => {
  try {
    const { data } = await API.get('/settings/aux');
    if (data.success) dispatch(setAuxConfig(data.data));
  } catch { /* silent */ }
};

export const fetchTeamAux = (userId) => async (dispatch) => {
  try {
    const { data } = await API.get('/hrm/aux/team');
    const team = data.data || [];
    dispatch(setTeamAux(team));
    if (userId) {
      const me = team.find((u) => u._id === userId);
      if (me) {
        dispatch(setCurrentAux({
          status: me.auxStatus,
          since: me.activeStatusSince ? new Date(me.activeStatusSince).getTime() : Date.now(),
        }));
        if (me.todayStats) dispatch(setTodayStats(me.todayStats));
      }
    }
  } catch { /* silent */ }
};

export const fetchMyPlan = (userId) => async (dispatch) => {
  if (!userId) return;
  try {
    const month = new Date().toISOString().slice(0, 7);
    const { data } = await API.get(`/hrm/aux/schedule?month=${month}&userId=${userId}`);
    const sched = (data.data || [])[0];
    if (sched) dispatch(setMyPlan(sched.monthlyPlan));
  } catch { /* silent */ }
};

export const changeAux = (status) => async (dispatch, getState) => {
  try {
    const { data } = await API.put('/hrm/aux', { auxStatus: status });
    const serverSince = data.data?.statusSince;
    dispatch(setCurrentAux({
      status,
      since: serverSince ? new Date(serverSince).getTime() : Date.now(),
    }));
    dispatch(updateCurrentUser({ auxStatus: status }));
    const userId = getState().auth.user?._id;
    if (userId) {
      dispatch(fetchTeamAux(userId));
    }
  } catch { /* silent */ }
};

// Selectors
export const enabledAuxesSelector = (state) =>
  state.aux.auxConfig?.availableAuxes
    ? state.aux.auxConfig.availableAuxes.filter((a) => a.enabled)
    : DEFAULT_AUXES;

export const auxCountsSelector = (state) => {
  const team = state.aux.teamAux || [];
  return {
    Live: team.filter((u) => u.auxStatus === 'Live').length,
    Training: team.filter((u) => u.auxStatus === 'Training').length,
    Break: team.filter((u) => u.auxStatus === 'Break').length,
    Coaching: team.filter((u) => u.auxStatus === 'Coaching').length,
    Lunch: team.filter((u) => u.auxStatus === 'Lunch').length,
    Other: team.filter((u) => u.auxStatus === 'Other').length,
    'Logged out': team.filter((u) => u.auxStatus === 'Logged out').length,
  };
};

export default auxSlice.reducer;
