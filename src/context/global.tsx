import React from 'react';

export interface IGlobal {
	isSmallScreen: boolean;
	size: { width: number; height: number };
}

export interface IGlobalContext {
	global?: IGlobal;
}

export const GlobalContext = React.createContext<IGlobalContext>({
	global: undefined,
});
