// import React, { forwardRef } from 'react';

// interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {}

// export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({ style, ...props }, ref) => (
//   <canvas
//     ref={ref}
//     {...props}
//     style={{
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       zIndex: 10,
//       pointerEvents: 'auto',
//       ...style, // 確保 props.style 能覆蓋
//     }}
//   />
// ));
import React, { forwardRef } from 'react';

export const Canvas = forwardRef<HTMLCanvasElement>((props, ref) => (
  <canvas
    ref={ref}
    id="annotation-canvas"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 10,
      pointerEvents: 'none', // 預設不能滑鼠互動，按 Shift 時才開啟
    }}
  />
));
