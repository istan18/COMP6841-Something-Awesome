import { createContext, useContext, FC, ReactNode, Dispatch, SetStateAction, useState } from "react";

// Define the type for your global state
interface GlobalState {
    uId: string | null;
    token: string | null;
    access: boolean;
    key: string | null;
}

export interface GlobalStateContextValue {
    globalState: GlobalState;
    setGlobalState: Dispatch<SetStateAction<GlobalState>>;
}

const GlobalStateContext = createContext<GlobalStateContextValue | undefined>(undefined);

// Define a custom hook for using the context
export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error("useGlobalState must be used within a GlobalStateProvider");
    }
    const { globalState, setGlobalState } = context;
    setGlobalState((state) => ({
        ...state,
        token: globalState.token || localStorage.getItem("token"),
    }));
    return context;
};

// Define the type for the GlobalStateProvider props
interface GlobalStateProviderProps {
    children: ReactNode;
}

// Create the GlobalStateProvider component
export const GlobalStateProvider: FC<GlobalStateProviderProps> = ({ children }) => {
    const [globalState, setGlobalState] = useState<GlobalState>({
        uId: null,
        token: null,
        access: false,
        key: null,
    });

    const value: GlobalStateContextValue = {
        globalState,
        setGlobalState,
    };

    return <GlobalStateContext.Provider value={value}>{children}</GlobalStateContext.Provider>;
};
