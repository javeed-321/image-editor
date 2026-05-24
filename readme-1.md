When does fit() actually run?
Four triggers, all routed through the same function:

Container resizes — orientation change, browser resize, toolbar wrapping, address bar collapse:


const ro = new ResizeObserver(fit);
ro.observe(wrap);                              // line 182-183
ResizeObserver also fires once immediately when you call .observe() — that's our initial fit.

A dep changes — padding, bgColor, zoom, or hasImage flips. The whole useEffect re-runs (line 185), which builds a new fit closure (with the latest values), stores it in fitRef, and re-observes.

User rotates — rotate() (line 276) does the math to spin every object 90° around the old center, then calls fitRef.current() at the end (line 308) to resize the canvas to the swapped dimensions.

Background image loads — the bgImage effect (line 199) assigns c.backgroundImage, then calls fitRef.current() to re-stretch and re-render in one go.