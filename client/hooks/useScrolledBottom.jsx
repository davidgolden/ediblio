import React, { useState, useEffect } from 'react';

const useScrolledBottom = () => {

    const [isBottom, setIsBottom] = useState(false);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });

    const handleScroll = () => {
        const scrollPosition = window.pageYOffset;
        const windowSize = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        const distanceToBottom = Math.max(bodyHeight - (scrollPosition + windowSize), 0);
        setIsBottom(distanceToBottom < 100);
    };

    return isBottom;
};

export default useScrolledBottom;
