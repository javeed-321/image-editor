import type { ComponentProps, FC } from 'react';

export const Highlighter: FC<ComponentProps<'svg'>> = (props) => {
  return (
    <svg
      role="img"
      aria-label="Highlighter"
      fill="none"
      height="50"
      viewBox="0 0 183 50"
      width="183"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M89 1H0v49h89V1Z" fill="#EEE" />
      <path d="M89 1H0v49h89V1Z" fill="url(#_1675523858__a)" />
      <path
        d="M125.39 50H89V1h36.39c.4 0 .78.12 1.11.34l9.43 6.3c4.93 3.3 10.74 5.06 16.67 5.06h8.4c1.1 0 2 .9 2 2v21.6c0 1.1-.9 2-2 2h-8.4a29.96 29.96 0 0 0-16.67 5.06l-9.43 6.3c-.32.22-.71.34-1.11.34Z"
        fill="#EEE"
      />
      <path
        d="M125.39 50H89V1h36.39c.4 0 .78.12 1.11.34l9.43 6.3c4.93 3.3 10.74 5.06 16.67 5.06h8.4c1.1 0 2 .9 2 2v21.6c0 1.1-.9 2-2 2h-8.4a29.96 29.96 0 0 0-16.67 5.06l-9.43 6.3c-.32.22-.71.34-1.11.34Z"
        fill="url(#_1675523858__b)"
      />
      <path
        d="M176.25 15c.45 0 .84.3.96.73l5.43 19c.18.64-.3 1.27-.96 1.27H163V15h13.25Z"
        fill="currentColor"
      />
      <path
        d="M176.849 15.83v.003l5.43 18.998v.001a.623.623 0 0 1-.599.793h-18.305v-20.25h12.875c.28 0 .524.186.599.456Z"
        stroke="#000"
        strokeOpacity=".1"
        strokeWidth=".75"
      />
      <path d="M89 45H0v3h89v-3Z" fill="#D9D9D9" />
      <path
        d="M115.07 9c4.42 0 8.65 1.83 11.67 5.06 5.77 6.15 5.77 15.73 0 21.89a15.98 15.98 0 0 1-11.67 5.06H95V25c0-8.84 7.16-16 16-16h4.07Z"
        fill="url(#_1675523858__c)"
        fillOpacity=".5"
      />
      <path
        clipRule="evenodd"
        d="M89 48h35.42c.38 0 .75-.11 1.07-.31l10.67-6.74c4.8-3.03 10.36-4.64 16.03-4.64H161c1.1 0 2-.9 2-2v1c0 1.1-.9 2-2 2h-8.4a29.96 29.96 0 0 0-16.67 5.06l-9.43 6.3c-.33.22-.72.34-1.11.34H89V48Zm36.39-48Z"
        fill="#C9C9C9"
        fillOpacity=".5"
        fillRule="evenodd"
      />
      <path d="M95 1h-6v49h6V1Z" fill="currentColor" />
      <path
        d="M89.375 49.625V1.375h5.25v48.25h-5.25Z"
        stroke="#000"
        strokeOpacity=".1"
        strokeWidth=".75"
      />
      <path
        d="m29 28.44 2.82-6.74 6.96 2.91-.9-3.21 4.83-4.4L56 22.14l-2.64 6.81-6.48-2.51.97 3.46-4.93 4.35L29 28.44Z"
        fill="url(#_1675523858__d)"
      />
      <path
        d="m39.141 24.509-.837-2.988 4.487-4.088 12.724 4.921-2.37 6.11-6.13-2.374-.698-.27.202.721.906 3.234-4.577 4.038-13.357-5.575 2.53-6.047 6.614 2.765.715.299-.209-.746Z"
        stroke="url(#_1675523858__e)"
        strokeOpacity=".07"
        strokeWidth=".75"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="_1675523858__a"
          x1="44.5"
          x2="44.5"
          y1="1"
          y2="55.5"
        >
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset=".245" stopColor="#fff" />
          <stop offset="1" stopColor="#C4C4C4" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="_1675523858__b"
          x1="126"
          x2="126"
          y1="50"
          y2="1"
        >
          <stop stopColor="#C4C4C4" />
          <stop offset=".725" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="_1675523858__d"
          x1="41.15"
          x2="32.65"
          y1="24.778"
          y2="21.278"
        >
          <stop offset=".177" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="_1675523858__e"
          x1="56"
          x2="29"
          y1="26"
          y2="26"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="matrix(-47 0 0 -32 129.001 41)"
          gradientUnits="userSpaceOnUse"
          id="_1675523858__c"
          r="1"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};
