// تعريف مخصص لمكتبة long
declare module 'long' {
  interface Long {
    high: number;
    low: number;
    unsigned: boolean;
    
    add(addend: Long | number | string): Long;
    subtract(subtrahend: Long | number | string): Long;
    multiply(multiplier: Long | number | string): Long;
    divide(divisor: Long | number | string): Long;
    modulo(divisor: Long | number | string): Long;
    
    equals(other: Long | number | string): boolean;
    compare(other: Long | number | string): number;
    
    toString(radix?: number): string;
    toNumber(): number;
    toJSON(): string;
    
    static fromNumber(value: number, unsigned?: boolean): Long;
    static fromString(str: string, unsigned?: boolean | number, radix?: number): Long;
    static fromValue(val: Long | number | string | { low: number; high: number; unsigned?: boolean }): Long;
    static isLong(obj: any): obj is Long;
    
    static ZERO: Long;
    static ONE: Long;
    static NEG_ONE: Long;
    static MAX_VALUE: Long;
    static MIN_VALUE: Long;
    static MAX_SAFE_INTEGER: Long;
    static MIN_SAFE_INTEGER: Long;
  }
  
  interface LongConstructor {
    new (low: number, high?: number, unsigned?: boolean): Long;
    (low: number, high?: number, unsigned?: boolean): Long;
    
    fromNumber(value: number, unsigned?: boolean): Long;
    fromString(str: string, unsigned?: boolean | number, radix?: number): Long;
    fromValue(val: Long | number | string | { low: number; high: number; unsigned?: boolean }): Long;
    isLong(obj: any): obj is Long;
    
    ZERO: Long;
    ONE: Long;
    NEG_ONE: Long;
    MAX_VALUE: Long;
    MIN_VALUE: Long;
    MAX_SAFE_INTEGER: Long;
    MIN_SAFE_INTEGER: Long;
  }
  
  const Long: LongConstructor;
  export = Long;
}

// تعريف global للـ Long
declare global {
  const Long: typeof import('long');
}

