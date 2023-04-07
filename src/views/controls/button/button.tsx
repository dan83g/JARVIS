import React from 'react';
import { Button, ButtonProps } from 'primereact/button';

interface Props extends ButtonProps {
    visible?: boolean;
}

export const ButtonControl = ({ visible = true, ...props }: Props) => {
    return (
        visible === false ? null : <Button {...props}/>
    );
}