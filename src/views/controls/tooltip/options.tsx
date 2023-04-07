
import { TooltipOptions } from 'primereact/tooltip/tooltipoptions';

export const tooltipOptions = (position: 'top' | 'bottom' | 'left' | 'right' | 'mouse' | undefined) : TooltipOptions => {
    return {position: position, className: 'w-3 ml-2'} as TooltipOptions;
}