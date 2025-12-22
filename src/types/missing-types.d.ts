// Fix for remaining TypeScript issues
declare module 'long' {
  interface Long {
    high: number;
    low: number;
    unsigned: boolean;
  }
  const Long: any;
  export = Long;
}
declare module 'phoenix' {
  const Phoenix: any;
  export = Phoenix;
}
