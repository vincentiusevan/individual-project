import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import heroReducer from '../features/heroes/heroSlice';
import itemReducer from '../features/items/itemSlice';
import strategyReducer from '../features/strategies/strategySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    heroes: heroReducer,
    items: itemReducer,
    strategies: strategyReducer,
  },
});

export default store;
