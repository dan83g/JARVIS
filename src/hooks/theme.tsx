// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState } from 'react';

// const isDarkTheme = useThemeDetector();
// return (
//  <p>Current Theme is: {isDarkTheme ? "dark": "light"}</p>
// );

export const useThemeDetector = () => {
    const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());  
    const mqListener = ((e: any) => {
        setIsDarkTheme(e.matches);
    });
    
    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMq.addEventListener("change", mqListener);      
       return () => darkThemeMq.removeEventListener("change", mqListener);
    }, []);
    return isDarkTheme;
}