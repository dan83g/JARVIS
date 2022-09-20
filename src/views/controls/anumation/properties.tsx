import React from 'react';
import { TransitionProps } from 'react-transition-group/Transition';


export const animationSpeed = (timeout: number): TransitionProps => {
    return {timeout: timeout}
};
