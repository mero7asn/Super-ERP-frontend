import { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  AUX_COLORS,
  AUX_ICONS,
  DEFAULT_AUXES,
  fetchAuxConfig,
  fetchTeamAux,
  fetchMyPlan,
  changeAux as changeAuxThunk,
  auxCountsSelector,
  enabledAuxesSelector,
} from '../store/auxSlice';

const AuxContext = createContext(null);

export { AUX_COLORS, AUX_ICONS, DEFAULT_AUXES };

export const AuxProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const intervalRef = useRef(null);

  const fetchTeam = useCallback(() => {
    if (user?._id) {
      dispatch(fetchTeamAux(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    dispatch(fetchAuxConfig());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      fetchTeam();
      dispatch(fetchMyPlan(user._id));
      intervalRef.current = setInterval(fetchTeam, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTeam, dispatch, user?._id]);

  const auxValue = useAux();

  return (
    <AuxContext.Provider value={auxValue}>
      {children}
    </AuxContext.Provider>
  );
};

export const useAux = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { teamAux, currentAux, statusSince, todayStats, myPlan, auxConfig } = useSelector(
    (state) => state.aux
  );
  const counts = useSelector(auxCountsSelector);
  const enabledAuxes = useSelector(enabledAuxesSelector);

  const fetchTeam = useCallback(() => {
    if (user?._id) {
      dispatch(fetchTeamAux(user._id));
    }
  }, [dispatch, user?._id]);

  const changeAux = useCallback((status) => {
    return dispatch(changeAuxThunk(status));
  }, [dispatch]);

  return useMemo(() => ({
    currentAux,
    statusSince,
    todayStats,
    myPlan,
    teamAux,
    counts,
    auxConfig,
    enabledAuxes,
    changeAux,
    fetchTeam,
  }), [
    currentAux,
    statusSince,
    todayStats,
    myPlan,
    teamAux,
    counts,
    auxConfig,
    enabledAuxes,
    changeAux,
    fetchTeam,
  ]);
};

export default AuxContext;
