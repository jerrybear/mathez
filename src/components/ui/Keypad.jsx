import React from 'react';
import { Delete, Check } from 'lucide-react';

const Keypad = ({ onKeyPress }) => {
    const keys = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9,
        'del', 0, '.',
        'enter'
    ];

    const handlePress = (key) => {
        if (onKeyPress) onKeyPress(key);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.8rem',
            width: '100%',
            maxWidth: '320px',
            margin: '0 auto'
        }}>
            {keys.map((key) => {
                let content = key;
                let btnClass = 'glass-btn';
                let style = { padding: '1rem', height: '64px', fontSize: '1.8rem', fontWeight: '600' };

                if (key === 'del') {
                    content = <Delete size={28} />;
                    btnClass += ' accent-bg';
                } else if (key === 'enter') {
                    content = <Check size={28} />;
                    btnClass += ' primary-bg';
                } else if (key === '.') {
                    content = '.';
                    style.fontSize = '2rem';
                } else {
                    // Add a subtle background to number keys for better contrast
                    style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                }

                return (
                    <button
                        key={key}
                        className={btnClass}
                        style={style}
                        onClick={() => handlePress(key)}
                        aria-label={`Key ${key}`}
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
};

export default Keypad;
