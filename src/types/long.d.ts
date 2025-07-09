// Type definitions for long.js
// Project: https://github.com/dcodeIO/long.js
// Definitions by: Peter Kooijmans <https://github.com/peterkooijmans>

declare module 'long' {
  interface Long {
    /** The high 32 bits as a signed value. */
    high: number;
    /** The low 32 bits as a signed value. */
    low: number;
    /** Whether unsigned or not. */
    unsigned: boolean;

    /** Returns the sum of this and the specified Long. */
    add(addend: Long | number | string): Long;
    /** Returns the difference of this and the specified Long. */
    subtract(subtrahend: Long | number | string): Long;
    /** Returns the product of this and the specified Long. */
    multiply(multiplier: Long | number | string): Long;
    /** Returns this Long divided by the specified. */
    divide(divisor: Long | number | string): Long;
    /** Returns this Long modulo the specified. */
    modulo(divisor: Long | number | string): Long;
    /** Tests if this Long's value equals the specified's. */
    equals(other: Long | number | string): boolean;
    /** Compares this Long's value with the specified's. */
    compare(other: Long | number | string): number;
    /** Converts the Long to a string written in the specified radix. */
    toString(radix?: number): string;
    /** Converts the Long to a 32 bit integer, assuming it is a 32 bit integer. */
    toInt(): number;
    /** Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa). */
    toNumber(): number;
    /** Converts this Long to its byte representation. */
    toBytes(le?: boolean): number[];
    /** Converts this Long to its little endian byte representation. */
    toBytesLE(): number[];
    /** Converts this Long to its big endian byte representation. */
    toBytesBE(): number[];
  }

  interface LongConstructor {
    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as signed integers.
     * See the from* functions below for more convenient ways of constructing Longs.
     */
    new(low: number, high?: number, unsigned?: boolean): Long;
    (low: number, high?: number, unsigned?: boolean): Long;

    /** Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. */
    fromBits(lowBits: number, highBits: number, unsigned?: boolean): Long;
    /** Returns a Long representing the given 32 bit integer value. */
    fromInt(value: number, unsigned?: boolean): Long;
    /** Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned. */
    fromNumber(value: number, unsigned?: boolean): Long;
    /** Returns a Long representation of the given string, written using the specified radix. */
    fromString(str: string, unsigned?: boolean | number, radix?: number): Long;
    /** Converts the specified value to a Long. */
    fromValue(val: Long | number | string | {low: number, high: number, unsigned: boolean}): Long;
    /** Tests if the specified object is a Long. */
    isLong(obj: any): obj is Long;

    /** Maximum signed value. */
    MAX_VALUE: Long;
    /** Minimum signed value. */
    MIN_VALUE: Long;
    /** Signed negative one. */
    NEG_ONE: Long;
    /** Signed one. */
    ONE: Long;
    /** Maximum unsigned value. */
    UMAX_VALUE: Long;
    /** Unsigned one. */
    UONE: Long;
    /** Unsigned zero. */
    UZERO: Long;
    /** Signed zero. */
    ZERO: Long;
  }

  const Long: LongConstructor;
  export = Long;
}

