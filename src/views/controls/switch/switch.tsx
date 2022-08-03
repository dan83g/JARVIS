import React, { useState } from 'react';
import { InputSwitch } from 'primereact/inputswitch';

const SwitchControl = () => {
    const [checked, setChecked] = useState(true);

    return (
        <div>
            <div className="card">
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
            </div>
        </div>
    );
}
  