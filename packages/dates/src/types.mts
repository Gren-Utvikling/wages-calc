import type { Temporal } from 'temporal-polyfill';

export type MonthName =
	| 'january'
	| 'february'
	| 'march'
	| 'april'
	| 'may'
	| 'june'
	| 'july'
	| 'august'
	| 'september'
	| 'october'
	| 'november'
	| 'december';

export type DayOfWeekName =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

export type DayType = 'workday' | 'offday';

export type CalendarYear = {
	readonly calendar: Temporal.Calendar;
	readonly year: number;
	readonly months: readonly [
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth,
		CalendarMonth
	];
};

export type CalendarMonth = {
	readonly month: Temporal.PlainYearMonth;
	readonly name: MonthName;
	readonly days: readonly CalendarDay[];
};

export type CalendarDay = {
	readonly day: Temporal.PlainDate;
	readonly dayOfWeek: DayOfWeekName;
	readonly type: DayType;
};
