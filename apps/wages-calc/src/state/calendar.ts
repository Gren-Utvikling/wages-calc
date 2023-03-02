import type {
	CalendarDay,
	CalendarMonth,
	CalendarYear,
	DayOfWeekName,
	DayType,
	MonthName,
} from '@grenutv/dates';
import type { Temporal } from 'temporal-polyfill';
import { createSignalObject, type SignalObject } from './solid.js';
import { Accessor, createMemo } from 'solid-js';

export type DayValue = number;

export type DayState = {
	readonly day: Temporal.PlainDate;
	readonly dayOfWeek: DayOfWeekName;
	readonly dayType: DayType;
	readonly value: SignalObject<DayValue>;
	readonly type: Accessor<DayType | 'vacation'>;
};

export type MonthState = {
	readonly month: Temporal.PlainYearMonth;
	readonly name: MonthName;
	readonly days: readonly DayState[];
	readonly totalHours: Accessor<number>;
	readonly workDays: Accessor<number>;
	readonly offDays: Accessor<number>;
	readonly vacationDays: Accessor<number>;
};

export type YearState = {
	readonly calendar: Temporal.Calendar;
	readonly year: number;
	readonly months: readonly [
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState,
		MonthState
	];
	readonly totalHours: Accessor<number>;
	readonly workDays: Accessor<number>;
	readonly offDays: Accessor<number>;
	readonly vacationDays: Accessor<number>;
};

const createDayState = ({
	day,
	dayOfWeek,
	type: dayType,
}: CalendarDay): DayState => {
	const name = day.day.toString();
	const value = createSignalObject(dayType === 'workday' ? 7.5 : 0, { name });
	const type = createMemo(
		() => {
			if (value.get() === 0) {
				return dayType === 'workday' ? 'vacation' : 'offday';
			}

			return 'workday';
		},
		{ name: `${name}:type` }
	);

	return Object.freeze({
		day: day,
		dayOfWeek: dayOfWeek,
		dayType: dayType,
		value,
		type,
	});
};

const createMonthState = (month: CalendarMonth): MonthState => {
	const name = month.name;
	const days = month.days.map(createDayState);
	const totalHours = createMemo(
		() => days.reduce((sum, day) => sum + day.value.get(), 0),
		{ name: `${name}:totalHours` }
	);
	const workDays = createMemo(
		() =>
			days.reduce((sum, day) => sum + (day.type() === 'workday' ? 1 : 0), 0),
		{ name: `${name}:workDays` }
	);
	const offDays = createMemo(
		() => days.reduce((sum, day) => sum + (day.type() === 'offday' ? 1 : 0), 0),
		{ name: `${name}:offDays` }
	);
	const vacationDays = createMemo(
		() =>
			days.reduce((sum, day) => sum + (day.type() === 'vacation' ? 1 : 0), 0),
		{ name: `${name}:vacationDays` }
	);

	return Object.freeze({
		month: month.month,
		name: month.name,
		days,
		totalHours,
		workDays,
		offDays,
		vacationDays,
	});
};

export const createYearState = (year: CalendarYear): YearState => {
	const months = year.months.map(createMonthState);
	const totalHours = createMemo(() =>
		months.reduce((sum, month) => sum + month.totalHours(), 0)
	);
	const workDays = createMemo(() =>
		months.reduce((sum, month) => sum + month.workDays(), 0)
	);
	const offDays = createMemo(() =>
		months.reduce((sum, month) => sum + month.offDays(), 0)
	);
	const vacationDays = createMemo(() =>
		months.reduce((sum, month) => sum + month.vacationDays(), 0)
	);

	return Object.freeze({
		calendar: year.calendar,
		year: year.year,
		months: months as never,
		totalHours,
		workDays,
		offDays,
		vacationDays,
	});
};
