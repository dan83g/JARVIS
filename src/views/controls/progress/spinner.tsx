import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';


const SpinnerControl = () => {
    return (
        <div>
            <div className="card">
                <h5>Basic</h5>
                <ProgressSpinner />

                <h5>Custom</h5>
                <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
        </div>
    );
}
  