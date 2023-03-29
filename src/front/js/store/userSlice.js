import { createSlice } from '@reduxjs/toolkit';

const TOKEN_STORAGE_KEY = 'user_token';

const loadToken = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    const { email, password, is_active } = JSON.parse(atob(token.split('.')[1]));
    return {
      email,
      password,
      is_active,
      token
    };
  }
  return null;
};

const saveToken = (token) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const deleteToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const userSlice = createSlice({
  name: 'user',
  initialState: loadToken() ?? {
    is_active: null,
    email: '',
    password: '',
    token: null
  },
  reducers: {
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setIs_active: (state, action) => {
      state.is_active = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      saveToken(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith('/fulfilled'),
      (state, action) => {
        saveStateToLocalStorage(state);
      }
    );
  }
});

const saveStateToLocalStorage = (state) => {
  localStorage.setItem('user', JSON.stringify(state));
};

export const { setPassword, setEmail, setToken, setIs_active } = userSlice.actions;

export default userSlice.reducer;
