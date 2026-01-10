import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import graph from './features/graphs/slice';
import node from './features/nodes/slice';
import edge from './features/edges/slice';
import pane from './features/panes/slice';

export const store = configureStore({
    reducer: { graph, node, edge, pane },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // TODO: シリアライズ可能な型と変換処理を導入して serializableCheck を有効化
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
