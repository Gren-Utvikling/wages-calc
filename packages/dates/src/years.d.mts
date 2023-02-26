import type { Year } from '@grenutv/tax-calc';
import type { CalendarYear } from './types.mjs';

export declare const year: (year: Year) => Promise<CalendarYear>;
export { years } from '@grenutv/tax-calc';
