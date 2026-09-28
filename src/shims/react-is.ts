// ES module shim for react-is ensuring seamless bundling in Vite/Rolldown
import * as ReactIsCJS from 'react-is';

// In CJS, exports might be wrapped under default or directly on the module
const actual = (ReactIsCJS as any).default || ReactIsCJS;

export const typeOf = actual.typeOf;
export const isAsyncMode = actual.isAsyncMode || (() => false);
export const isConcurrentMode = actual.isConcurrentMode || (() => false);
export const isContextConsumer = actual.isContextConsumer;
export const isContextProvider = actual.isContextProvider;
export const isElement = actual.isElement;
export const isForwardRef = actual.isForwardRef;
export const isFragment = actual.isFragment;
export const isLazy = actual.isLazy;
export const isMemo = actual.isMemo;
export const isPortal = actual.isPortal;
export const isProfiler = actual.isProfiler;
export const isStrictMode = actual.isStrictMode;
export const isSuspense = actual.isSuspense;
export const isSuspenseList = actual.isSuspenseList;
export const isValidElementType = actual.isValidElementType;

export const ContextConsumer = actual.ContextConsumer;
export const ContextProvider = actual.ContextProvider;
export const Element = actual.Element;
export const ForwardRef = actual.ForwardRef;
export const Fragment = actual.Fragment;
export const Lazy = actual.Lazy;
export const Memo = actual.Memo;
export const Portal = actual.Portal;
export const Profiler = actual.Profiler;
export const StrictMode = actual.StrictMode;
export const Suspense = actual.Suspense;
export const SuspenseList = actual.SuspenseList;

export default actual;
