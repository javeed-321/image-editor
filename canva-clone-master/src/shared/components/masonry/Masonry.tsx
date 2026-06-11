import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MasonryProps {
  children: React.ReactNode;
  columnsCount?: number;
  gutter?: string;
  className?: string | null;
  style?: React.CSSProperties;
  containerTag?: string;
  itemTag?: string;
  itemStyle?: React.CSSProperties;
  sequential?: boolean;
}

interface ColumnData {
  columns: React.ReactNode[][];
  childRefs: React.RefObject<HTMLDivElement>[];
}

const Masonry: React.FC<MasonryProps> = ({
  children,
  columnsCount = 3,
  gutter = '0',
  className = null,
  style = {},
  containerTag = 'div',
  itemTag = 'div',
  itemStyle = {},
  sequential = false,
}) => {
  const [state, setState] = useState<
    ColumnData & {
      hasDistributed: boolean;
      children: React.ReactNode;
    }
  >({
    columns: [],
    childRefs: [],
    hasDistributed: false,
    children: null,
  });

  const prevChildrenRef = useRef<React.ReactNode>(null);
  const prevColumnsCountRef = useRef<number>(columnsCount);

  const getEqualCountColumns = useCallback(
    (children: React.ReactNode, columnsCount: number): ColumnData => {
      const columns: React.ReactNode[][] = Array.from(
        { length: columnsCount },
        () => [],
      );
      let validIndex = 0;
      const childRefs: React.RefObject<HTMLDivElement>[] = [];

      React.Children.forEach(children, (child) => {
        if (child && React.isValidElement(child)) {
          const ref = React.createRef<HTMLDivElement>();
          childRefs.push(ref);
          columns[validIndex % columnsCount].push(
            <div
              style={{ display: 'flex', justifyContent: 'stretch' }}
              key={validIndex}
              ref={ref}
            >
              {child}
            </div>,
          );
          validIndex++;
        }
      });
      return { columns, childRefs };
    },
    [],
  );

  const distributeChildren = useCallback(() => {
    const columnHeights = Array(columnsCount).fill(0);

    const isReady = state.childRefs.every(
      (ref) => ref.current?.getBoundingClientRect().height,
    );

    if (!isReady) return;

    const columns: React.ReactNode[][] = Array.from(
      { length: columnsCount },
      () => [],
    );
    let validIndex = 0;
    React.Children.forEach(children, (child) => {
      if (child && React.isValidElement(child)) {
        const childHeight =
          state.childRefs[validIndex].current?.getBoundingClientRect().height ||
          0;
        const minHeightColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights),
        );
        columnHeights[minHeightColumnIndex] += childHeight;
        columns[minHeightColumnIndex].push(child);
        validIndex++;
      }
    });

    setState((prev) => ({ ...prev, columns, hasDistributed: true }));
  }, [children, columnsCount, state.childRefs]);

  useEffect(() => {
    // Check if children or columnsCount have changed by comparing current vs previous
    const childrenChanged = prevChildrenRef.current !== children;
    const columnsCountChanged = prevColumnsCountRef.current !== columnsCount;

    if (childrenChanged || columnsCountChanged) {
      const newState = getEqualCountColumns(children, columnsCount);
      setState((prev) => ({
        ...prev,
        ...newState,
        children,
        hasDistributed: false,
      }));

      // Update refs to current values
      prevChildrenRef.current = children;
      prevColumnsCountRef.current = columnsCount;
    }
  }, [children, columnsCount, getEqualCountColumns]);

  useEffect(() => {
    if (!state.hasDistributed && !sequential) {
      distributeChildren();
    }
  }, [state.hasDistributed, sequential, distributeChildren]);

  const renderColumns = () => {
    return state.columns.map((column, i) =>
      React.createElement(
        itemTag,
        {
          key: i,
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignContent: 'stretch',
            flex: 1,
            width: 0,
            gap: gutter,
            ...itemStyle,
          },
        },
        column.map((item) => item),
      ),
    );
  };

  return React.createElement(
    containerTag,
    {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'stretch',
        boxSizing: 'border-box',
        width: '100%',
        gap: gutter,
        ...style,
      },
      className,
    },
    renderColumns(),
  );
};

export default Masonry;
