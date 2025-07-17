declare module "*.json" {
  const value: any
  export default value
  
}
declare module 'https://esm.sh/@unyt/datex@0.0.4' {
  export const Datex: any;
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: { immediate?: boolean }): void;
}

declare module '@unyt/datex@0.0.4';