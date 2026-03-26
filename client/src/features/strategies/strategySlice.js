import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

export const getAIStrategy = createAsyncThunk(
  'strategies/getAI',
  async (enemyHeroIds, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/counter-strategy', { enemyHeroIds });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to get AI strategy' });
    }
  }
);

export const fetchStrategies = createAsyncThunk(
  'strategies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/strategies');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch strategies' });
    }
  }
);

export const saveStrategy = createAsyncThunk(
  'strategies/save',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/strategies', body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to save strategy' });
    }
  }
);

export const deleteStrategy = createAsyncThunk(
  'strategies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/strategies/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete strategy' });
    }
  }
);

export const voteStrategy = createAsyncThunk(
  'strategies/vote',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/strategies/${id}/vote`, { type });
      return { id, likes: data.likes };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to vote' });
    }
  }
);

const strategySlice = createSlice({
  name: 'strategies',
  initialState: {
    list: [],
    aiResult: null,
    loading: false,
    aiLoading: false,
    error: null,
  },
  reducers: {
    clearAIResult(state) {
      state.aiResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAIStrategy.pending, (state) => {
        state.aiLoading = true;
        state.error = null;
        state.aiResult = null;
      })
      .addCase(getAIStrategy.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiResult = action.payload;
      })
      .addCase(getAIStrategy.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchStrategies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStrategies.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStrategies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(saveStrategy.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      .addCase(deleteStrategy.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
      })

      .addCase(voteStrategy.fulfilled, (state, action) => {
        const strategy = state.list.find((s) => s.id === action.payload.id);
        if (strategy) strategy.likes = action.payload.likes;
      });
  },
});

export const { clearAIResult } = strategySlice.actions;
export default strategySlice.reducer;
