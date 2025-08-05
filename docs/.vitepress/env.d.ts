declare module "*.json" {
  const value: any
  export default value
  
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: { immediate?: boolean }): void;
}