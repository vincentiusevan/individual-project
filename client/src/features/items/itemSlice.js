import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

export const fetchItems = createAsyncThunk(
  'items/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/items', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch items' });
    }
  }
);

export const fetchItemById = createAsyncThunk(
  'items/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/items/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch item' });
    }
  }
);

const itemSlice = createSlice({
  name: 'items',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearItemDetail(state) {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchItemById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearItemDetail } = itemSlice.actions;
export default itemSlice.reducer;
