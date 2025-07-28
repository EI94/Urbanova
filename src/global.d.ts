// Global type declarations for Urbanova - React 19 Compatible
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react' {
  export interface ReactNode {
    children?: ReactNode;
  }
  
  export interface ChangeEvent<T = HTMLInputElement> {
    target: T & { name: string; value: string; type: string };
  }
  
  export interface FormEvent<T = HTMLFormElement> {
    preventDefault(): void;
    target: T;
  }
  
  export interface MouseEvent<T = HTMLElement> {
    preventDefault(): void;
    target: T;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function forwardRef<T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactElement | null): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
  
  const React: any;
  export default React;
}

// Export empty to make this a module
export {}; 