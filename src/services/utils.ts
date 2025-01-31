import React from 'react';

interface HandleNameChangeProps {
    e: React.ChangeEvent<HTMLInputElement>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setNameError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleNameChange = (
    e: HandleNameChangeProps['e'],
    setName: HandleNameChangeProps['setName'],
    setNameError: HandleNameChangeProps['setNameError']
) => {
    const value = e.target.value;
    if (/^[A-Za-z]*$/.test(value)) {
        setName(value);
        setNameError(false);
    } else {
        setNameError(true);
    }
};