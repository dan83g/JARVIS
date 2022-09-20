
import React from 'react';
import TooltipOptions from 'primereact/tooltip/tooltipoptions';
import { TooltipPositionType } from 'primereact/tooltip/tooltipoptions';


export const tooltipOptions = (position: TooltipPositionType): TooltipOptions => {
    return {position: position, className: 'w-3 ml-2'}
}