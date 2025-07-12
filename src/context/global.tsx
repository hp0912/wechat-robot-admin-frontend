import React from 'react';

export interface IGlobal {
	isSmallScreen: boolean;
}

export interface IGlobalContext {
	global?: IGlobal;
}

export const GlobalContext = React.createContext<IGlobalContext>({
	global: undefined,
});
