import { Context } from "./context";
import { useGlobalStates } from './useGlobalStates';

export const StateProvider = ({children}) => {
    const store = useGlobalStates();

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    )
}