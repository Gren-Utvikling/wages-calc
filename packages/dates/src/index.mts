import { Temporal } from 'temporal-polyfill';
import DateHolidays from 'date-holidays';

const norwegianHolidays = new DateHolidays('no');
const calendar = Temporal.Calendar.from('iso8601');

export type Month =
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

export type DayOfWeek =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

export type DayType = 'workday' | 'offday' | 'vacation';

export type CalendarYear = {
	readonly year: number;
	readonly january: CalendarMonth;
	readonly february: CalendarMonth;
	readonly march: CalendarMonth;
	readonly april: CalendarMonth;
	readonly may: CalendarMonth;
	readonly june: CalendarMonth;
	readonly july: CalendarMonth;
	readonly august: CalendarMonth;
	readonly september: CalendarMonth;
	readonly october: CalendarMonth;
	readonly november: CalendarMonth;
	readonly december: CalendarMonth;
};

export type CalendarMonth = {
	readonly month: Month;
	readonly days: readonly CalendarDay[];
};

type MutableCalendarMonth = {
	readonly month: Month;
	readonly days: CalendarDay[];
};

export type CalendarDay = {
	readonly day: Temporal.PlainDate;
	readonly dayOfWeek: DayOfWeek;
	readonly type: DayType;
};

const getDayOfWeek = (dow: number): DayOfWeek => {
	switch (dow) {
		case 1:
			return 'monday';
		case 2:
			return 'tuesday';
		case 3:
			return 'wednesday';
		case 4:
			return 'thursday';
		case 5:
			return 'friday';
		case 6:
			return 'saturday';
		case 7:
			return 'sunday';
		default:
			throw new Error(`Invalid day of week: ${dow}`);
	}
};

export const calendarYear = (year: number): CalendarYear => {
	let start = calendar.dateFromFields({ year, month: 1, day: 1 });
	const january: MutableCalendarMonth = { month: 'january', days: [] };
	const february: MutableCalendarMonth = { month: 'february', days: [] };
	const march: MutableCalendarMonth = { month: 'march', days: [] };
	const april: MutableCalendarMonth = { month: 'april', days: [] };
	const may: MutableCalendarMonth = { month: 'may', days: [] };
	const june: MutableCalendarMonth = { month: 'june', days: [] };
	const july: MutableCalendarMonth = { month: 'july', days: [] };
	const august: MutableCalendarMonth = { month: 'august', days: [] };
	const september: MutableCalendarMonth = { month: 'september', days: [] };
	const october: MutableCalendarMonth = { month: 'october', days: [] };
	const november: MutableCalendarMonth = { month: 'november', days: [] };
	const december: MutableCalendarMonth = { month: 'december', days: [] };

	const months = [
		january,
		february,
		march,
		april,
		may,
		june,
		july,
		august,
		september,
		october,
		november,
		december,
	];

	const holidays = norwegianHolidays
		.getHolidays(year)
		.filter((h) => h.type !== 'observance')
		.map((h) =>
			calendar.dateFromFields({
				year: h.start.getFullYear(),
				month: h.start.getMonth() + 1,
				day: h.start.getDate(),
			})
		);

	while (start.year === year) {
		const month = months[start.month - 1];
		const dayOfWeek = getDayOfWeek(start.dayOfWeek);

		const isHoliday =
			start.dayOfWeek >= 6 || holidays.some((h) => h.equals(start));
		const type = isHoliday ? 'offday' : 'workday';

		month.days.push({ day: start, dayOfWeek, type });
		start = start.add({ days: 1 });
	}

	return {
		year,
		january,
		february,
		march,
		april,
		may,
		june,
		july,
		august,
		september,
		october,
		november,
		december,
	};
};
