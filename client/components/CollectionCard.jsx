import React from 'react';

export default function CollectionCard(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width={250} height={200}>
            <path fill="#164e57"
                  d="M18 40h289v183.8c0 4.2-1.3 6.8-5.7 7.2h-283.1c-6.7 .7-8.4-2.8-8.2-7.9v-174.6c-0.8-6.2 1.9-9 8-8.5Z"/>
            <path fill="#2da2b5"
                  d="M208 11h93c4.4-0.7 6 2 6 4v25h-115c3-2.5 6.2-3.7 8-9c1.4-3.9 2.2-10.1 3-16c0-1.6 2.7-4.2 5-4Z"/>
            {props.images.map((image, i) => {
                let width, height, x, y;
                if (props.images.length === 1) {
                    width = 287;
                    height = 180;
                    y = 45;
                    x = 15;
                } else if (props.images.length === 2) {
                    width = 140;
                    height = 180;
                    x = 15 + (145 * i);
                    y = 45;
                } else if (props.images.length === 3) {
                    width = i === 0 ? 287 : 140;
                    height = 87.5;
                    x = i < 2 ? 15 : 15 + 145;
                    y = i === 0 ? 45 : 45 + 92.5;
                } else if (props.images.length === 4) {
                    width = 140;
                    height = 87.5;
                    x = i === 0 || i === 2 ? 15 : 15 + 145;
                    y = i < 2 ? 45 : 45 + 90;
                }
                return <image key={i} preserveAspectRatio="xMidYMid slice" href={image} width={width} height={height} x={x} y={y} />
            })}
        </svg>
    )
}
