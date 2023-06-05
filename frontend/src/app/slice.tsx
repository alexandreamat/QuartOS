import { createSlice } from '@reduxjs/toolkit'

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

const slice = createSlice({
    name: 'app',
    initialState: {
        isSideBarOpen: false,
        isMobile: isMobile(),
    },
    reducers: {
        toggleSidebar: (state) => { state.isSideBarOpen = !state.isSideBarOpen; },
        windowResize: (state) => {
            state.isMobile = isMobile();
        },
    },
});

export const {
    windowResize,
    toggleSidebar,
} = slice.actions;

export default slice.reducer;

