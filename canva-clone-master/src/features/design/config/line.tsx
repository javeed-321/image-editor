import type { LayerId } from '@lidojs/design-core';
import type { DeepPartial, LineLayerProps } from '@lidojs/design-editor';
import type { ReactElement } from 'react';
import { v4 } from 'uuid';

export type Line = {
  id: LayerId;
  props: DeepPartial<LineLayerProps>;
  icon: ReactElement;
};

export const lines: Line[] = [
  {
    id: v4(),
    props: {
      style: 'solid',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="0.5"
          x2="32.5"
        />
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'shortDashes',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Short Dashes"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray="3,1"
          strokeLinecap="butt"
          x1="0.5"
          x2="32.5"
        />
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'dots',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Dots"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray="1,1"
          strokeLinecap="butt"
          x1="0.5"
          x2="32.5"
        />
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'bar',
      arrowEnd: 'bar',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Bar Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="1"
          x2="32"
        />
        <rect height="4" rx="0.5" stroke="none" width="1" x="0" y="-2" />
        <g transform="translate(33)">
          <rect height="4" rx="0.5" stroke="none" width="1" x="-1" y="-2" />
        </g>
      </svg>
    ),
  },

  {
    id: v4(),
    props: {
      style: 'dots',
      arrowStart: 'none',
      arrowEnd: 'arrow',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Dots with Arrow End"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray="1,1"
          strokeLinecap="butt"
          x1="0.5"
          x2="32.25"
        />
        <g transform="translate(33)">
          <path
            d="M -2.5,-1.5,-0.5,0,-2.5,1.5 "
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'arrow',
      arrowEnd: 'arrow',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Arrow Start and End"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="0.75"
          x2="32.25"
        />
        <path
          d="M 2.5,-1.5,0.5,0,2.5,1.5 "
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform="translate(33)">
          <path
            d="M -2.5,-1.5,-0.5,0,-2.5,1.5 "
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },

  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'outlineDiamond',
      arrowEnd: 'outlineDiamond',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Dots"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="3.5"
          x2="29.5"
        />
        <path
          d="M 0.5,0 l 1.5,-1.5 1.5,1.5 -1.5,1.5 Z"
          fill="none"
          strokeLinejoin="round"
        />
        <g transform="translate(33)">
          <path
            d="M -0.5,0 l -1.5,-1.5 -1.5,1.5 1.5,1.5 Z"
            fill="none"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'diamond',
      arrowEnd: 'diamond',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Diamond Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="3.5"
          x2="29.5"
        />
        <path
          d="M 0.5,0 l 1.5,-1.5 1.5,1.5 -1.5,1.5 Z"
          fill="inherit"
          strokeLinejoin="round"
        />
        <g transform="translate(33)">
          <path
            d="M -0.5,0 l -1.5,-1.5 -1.5,1.5 1.5,1.5 Z"
            fill="inherit"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'none',
      arrowEnd: 'arrow',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Arrow End"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="0.5"
          x2="32.25"
        />
        <g transform="translate(33)">
          <path
            d="M -2.5,-1.5,-0.5,0,-2.5,1.5 "
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'none',
      arrowEnd: 'triangle',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Triangle End"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="0.5"
          x2="30"
        />
        <g transform="translate(33)">
          <path
            d="M -2.5,-1.5,-0.5,0,-2.5,1.5 Z"
            fill="inherit"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'circle',
      arrowEnd: 'circle',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Circle Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="4"
          x2="29"
        />
        <circle cx="2" fill="inherit" r="1.5" />
        <g transform="translate(33)">
          <circle cx="-2" fill="inherit" r="1.5" />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'square',
      arrowEnd: 'square',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Square Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="4"
          x2="29"
        />
        <rect
          fill="inherit"
          height="3"
          strokeLinejoin="round"
          width="3"
          x="0.5"
          y="-1.5"
        />
        <g transform="translate(33)">
          <rect
            fill="inherit"
            height="3"
            strokeLinejoin="round"
            width="3"
            x="-3.5"
            y="-1.5"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'outlineSquare',
      arrowEnd: 'outlineSquare',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Outline Square Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="4"
          x2="29"
        />
        <rect
          fill="none"
          height="3"
          strokeLinejoin="round"
          width="3"
          x="0.5"
          y="-1.5"
        />
        <g transform="translate(33)">
          <rect
            fill="none"
            height="3"
            strokeLinejoin="round"
            width="3"
            x="-3.5"
            y="-1.5"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'dots',
      arrowStart: 'triangle',
      arrowEnd: 'triangle',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Dots with Triangle Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray="1,1"
          strokeLinecap="butt"
          x1="3"
          x2="30"
        />
        <path
          d="M 2.5,-1.5,0.5,0,2.5,1.5 Z"
          fill="inherit"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform="translate(33)">
          <path
            d="M -2.5,-1.5,-0.5,0,-2.5,1.5 Z"
            fill="inherit"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
  {
    id: v4(),
    props: {
      style: 'solid',
      arrowStart: 'outlineCircle',
      arrowEnd: 'outlineCircle',
      boxSize: {
        height: 4,
      },
      color: 'rgb(94, 98, 120)',
    },
    icon: (
      <svg
        role="img"
        aria-label="Solid with Outline Circle Arrows"
        fill="currentColor"
        stroke="currentColor"
        style={{ overflow: 'visible' }}
        viewBox="0 -0.5 33 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          fill="none"
          strokeDasharray=""
          strokeLinecap="butt"
          x1="4"
          x2="29"
        />
        <circle cx="2" fill="none" r="1.5" />
        <g transform="translate(33)">
          <circle cx="-2" fill="none" r="1.5" />
        </g>
      </svg>
    ),
  },
];
