import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

export const fetchHeroes = createAsyncThunk(
  'heroes/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/heroes', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch heroes' });
    }
  }
);

export const fetchHeroById = createAsyncThunk(
  'heroes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/heroes/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch hero' });
    }
  }
);

export const fetchHeroCounters = createAsyncThunk(
  'heroes/fetchCounters',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/heroes/${id}/counters`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch counters' });
    }
  }
);

export const syncHeroes = createAsyncThunk('heroes/sync', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/heroes/sync');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to sync heroes' });
  }
});

const heroSlice = createSlice({
  name: 'heroes',
  initialState: {
    list: [],
    detail: null,
    counters: null,
    loading: false,
    countersLoading: false,
    countersError: null,
    error: null,
  },
  reducers: {
    clearHeroDetail(state) {
      state.detail = null;
      state.counters = null;
      state.countersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeroes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchHeroes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchHeroById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHeroById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchHeroById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchHeroCounters.pending, (state) => {
        state.countersLoading = true;
        state.countersError = null;
      })
      .addCase(fetchHeroCounters.fulfilled, (state, action) => {
        state.countersLoading = false;
        state.counters = action.payload;
      })
      .addCase(fetchHeroCounters.rejected, (state, action) => {
        state.countersLoading = false;
        state.counters = null;
        state.countersError = action.payload?.message || 'Failed to fetch counters';
      })

      .addCase(syncHeroes.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncHeroes.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(syncHeroes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearHeroDetail } = heroSlice.actions;
export default heroSlice.reducer;
