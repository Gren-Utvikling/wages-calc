import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { years } from '@grenutv/tax-calc';
import { Temporal } from 'temporal-polyfill';
import DateHolidays from 'date-holidays';
import type {
	DayOfWeekName,
	CalendarYear,
	CalendarMonth,
} from '../src/types.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist', 'years');

const norwegianHolidays = new DateHolidays('no');
const calendar = Temporal.Calendar.from('iso8601') as Temporal.Calendar;

type MutableArray<T extends readonly unknown[]> = T extends readonly (infer I)[]
	? I[]
	: never;
type MutableCalendarMonth = Omit<CalendarMonth, 'days'> & {
	readonly days: MutableArray<CalendarMonth['days']>;
};

const getDayOfWeek = (dow: number): DayOfWeekName => {
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

const calendarYear = (year: number): CalendarYear => {
	let start = calendar.dateFromFields({ year, month: 1, day: 1 });
	const january: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 1 }),
		name: 'january',
		days: [],
	};
	const february: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 2 }),
		name: 'february',
		days: [],
	};
	const march: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 3 }),
		name: 'march',
		days: [],
	};
	const april: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 4 }),
		name: 'april',
		days: [],
	};
	const may: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 5 }),
		name: 'may',
		days: [],
	};
	const june: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 6 }),
		name: 'june',
		days: [],
	};
	const july: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 7 }),
		name: 'july',
		days: [],
	};
	const august: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 8 }),
		name: 'august',
		days: [],
	};
	const september: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 9 }),
		name: 'september',
		days: [],
	};
	const october: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 10 }),
		name: 'october',
		days: [],
	};
	const november: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 11 }),
		name: 'november',
		days: [],
	};
	const december: MutableCalendarMonth = {
		month: calendar.yearMonthFromFields({ year, month: 12 }),
		name: 'december',
		days: [],
	};

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
		calendar,
		year,
		months: Object.freeze(months as never),
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

try {
	await fs.rm(distDir, { recursive: true });
} catch {}

await fs.mkdir(distDir, { recursive: true });

for (const yearString of years) {
	const year = parseInt(yearString, 10);
	const calendar = calendarYear(year);

	const sources = [
		`import { Temporal } from 'temporal-polyfill';`,
		``,
		`export const calendar = Temporal.Calendar.from('iso8601');`,
	];
	for (const month of calendar.months) {
		sources.push(``, `export const ${month.name}Days = Object.freeze([`);
		for (const day of month.days) {
			sources.push(
				`	Object.freeze({ day: calendar.dateFromFields({ year: ${day.day.year}, month: ${day.day.month}, day: ${day.day.day} }), dayOfWeek: '${day.dayOfWeek}', type: '${day.type}' }),`
			);
		}
		sources.push(
			`]);`,
			``,
			`export const ${month.name} = Object.freeze({`,
			`	month: calendar.yearMonthFromFields({ year: ${year}, month: ${month.month.month} }),`,
			`	name: '${month.name}',`,
			`	days: ${month.name}Days,`,
			`});`
		);
	}

	sources.push(
		``,
		`export const year = Object.freeze({`,
		`	calendar,`,
		`	year: ${year},`,
		`	months: Object.freeze([`,
		`		january,`,
		`		february,`,
		`		march,`,
		`		april,`,
		`		may,`,
		`		june,`,
		`		july,`,
		`		august,`,
		`		september,`,
		`		october,`,
		`		november,`,
		`		december,`,
		`	]),`,
		`	january,`,
		`	february,`,
		`	march,`,
		`	april,`,
		`	may,`,
		`	june,`,
		`	july,`,
		`	august,`,
		`	september,`,
		`	october,`,
		`	november,`,
		`	december,`,
		`});`
	);

	const file = path.resolve(distDir, `${year}.mjs`);
	const souce = sources.join(`\n`) + `\n`;
	await fs.writeFile(file, souce, 'utf8');
}

const indexContent = years.map(
	(y) =>
		`export const year${y} = async () => (await import('./years/${y}.mjs')).year;`
);
indexContent.push(``, `export const year = (year) => {`, `	switch (year) {`);
for (const year of years) {
	indexContent.push(`		case '${year}': return year${year}();`);
}
indexContent.push(`		default: throw new Error('Unknown year');`, `	}`, `};`);

indexContent.push(``, `export { years } from '@grenutv/tax-calc';`);

const indexFile = path.resolve(distDir, `../years.mjs`);
const indexSource = indexContent.join(`\n`) + `\n`;
await fs.writeFile(indexFile, indexSource, 'utf8');
