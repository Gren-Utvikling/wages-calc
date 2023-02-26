import { A } from 'solid-start';
import Counter from '~/components/Counter';
import { years } from '@grenutv/tax-calc';
import { type CalendarMonth, year } from '@grenutv/dates';

const currentYear = years[years.length - 1];
const calendar = await year(currentYear);

const monthNames = (() => {
	const format = new Intl.DateTimeFormat('en', { month: 'long' }).format;
	return calendar.months.map((m) =>
		format(new Date(Date.UTC(2021, m.month.month - 1)))
	);
})();

const monthName = (month: CalendarMonth) => {
	return monthNames[month.month.month - 1];
};

const MonthView = ({ month }: { readonly month: CalendarMonth }) => {
	return (
		<div
			class="border border-gray-700 dark:border-gray-300"
			data-month={month.name}
		>
			<h2 class="text-2xl text-sky-700 dark:text-sky-300 font-thin uppercase my-4">
				{monthName(month)}
			</h2>
		</div>
	);
};

export default function Home() {
	return (
		<main class="text-center mx-auto text-gray-700 dark:text-gray-300 p-4">
			<h1 class="max-6-xs text-6xl text-sky-700 dark:text-sky-300 font-thin uppercase my-16">
				{calendar.year}
			</h1>
			{calendar.months.map((month) => (
				<MonthView month={month} />
			))}
		</main>
	);
}
