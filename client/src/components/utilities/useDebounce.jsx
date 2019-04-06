import React, { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {

    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
        const disabler = setTimeout(() => {
            setDebounceValue(value)
        }, delay);

        return () => {
            clearTimeout(disabler);
        }
    }, [value]);

    return debounceValue;
};

export default useDebounce;
