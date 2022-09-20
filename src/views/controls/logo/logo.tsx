import React from 'react';
import { Image } from 'primereact/image';
import { useRootStore } from '../../../index';
import { observer } from 'mobx-react-lite';


export const Logo = observer(() => {
    const { userStore } = useRootStore()
    return (
        <Image src="/logo.png" alt="Something wrong with Jarvis image" className={`logo mt-2 ml-2 ${userStore.logoClass}`} width="175"/>
    )
})