import { years } from '@grenutv/tax-calc';
import { type CalendarMonth, year } from '@grenutv/dates';
import { type Temporal } from 'temporal-polyfill';
import { createSignal, createMemo } from 'solid-js';
import { FlipButton, FlipCard } from '~/components/FlipCard';

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

const CalCell = ({ children, class: className }: any) => {
	return <div class={`p-2 ${className}`}>{children}</div>;
};

const DayView = ({
	day,
	type,
}: {
	readonly day: Temporal.PlainDate;
	readonly type: 'workday' | 'offday' | 'vacation';
}) => {
	return <CalCell>{day.day}</CalCell>;
};

const MonthCalendarView = ({ month }: { readonly month: CalendarMonth }) => {
	const firstDay = month.days[0].day;
	const cells = [
		<CalCell>Wk</CalCell>,
		<CalCell>Mo</CalCell>,
		<CalCell>Tu</CalCell>,
		<CalCell>We</CalCell>,
		<CalCell>Th</CalCell>,
		<CalCell>Fr</CalCell>,
		<CalCell>Sa</CalCell>,
		<CalCell>Su</CalCell>,
	];

	if (firstDay.dayOfWeek > 0) {
		cells.push(<div>{firstDay.weekOfYear}</div>);
		for (let i = 0; i < firstDay.dayOfWeek - 1; i++) {
			cells.push(<CalCell />);
		}
	}

	for (const day of month.days) {
		if (day.day.dayOfWeek === 1) {
			cells.push(<CalCell>{day.day.weekOfYear}</CalCell>);
		}
		cells.push(<DayView day={day.day} type={day.type} />);
	}

	return <div class="grid grid-cols-8 gap-1">{cells}</div>;
};

type MonthViewProps = {
	readonly month: CalendarMonth;
};

const MonthWageView = ({ month }: MonthViewProps) => {
	return (
		<div>
			<p>Front</p>
		</div>
	);
};

// const MonthView = ({ month }: { readonly month: CalendarMonth }) => {
// 	const [showCalendar, setShowCalendar] = createSignal(false);
// 	const content = createMemo(() =>
// 		showCalendar() ? (
// 			<MonthCalendarView month={month} />
// 		) : (
// 			<MonthWageView month={month} />
// 		)
// 	);

// 	return (
// 		<div
// 			class="border border-gray-700 dark:border-gray-300 m-2 p-2 rounded"
// 			data-month={month.name}
// 		>
// 			<h2
// 				class="text-2xl text-sky-700 dark:text-sky-300 font-thin uppercase my-4"
// 				onClick={() => setShowCalendar((v) => !v)}
// 			>
// 				{monthName(month)}
// 			</h2>

// 			{content()}
// 		</div>
// 	);
// };

type MonthViewSideProps = MonthViewProps & {
	readonly onFlip: () => void;
};

const MonthViewFront = ({ month, onFlip }: MonthViewSideProps) => {
	return (
		<>
			<h2 class="text-2xl text-sky-700 dark:text-sky-300 font-thin uppercase my-4">
				{monthName(month)}
			</h2>
			<FlipButton onClick={onFlip} />
		</>
	);
};

const MonthViewBack = ({ month, onFlip }: MonthViewSideProps) => {
	return (
		<>
			<h2 class="text-2xl text-sky-700 dark:text-sky-300 font-thin uppercase my-4">
				{monthName(month)}
			</h2>
			<FlipButton onClick={onFlip} />
			<MonthCalendarView month={month} />
		</>
	);
};

const MonthView = ({ month }: { readonly month: CalendarMonth }) => {
	const [flipped, setFlipped] = createSignal(false);
	const flip = () => {
		setFlipped((v) => !v);
	};

	return (
		<FlipCard
			front={<MonthViewFront month={month} onFlip={flip} />}
			back={<MonthViewBack month={month} onFlip={flip} />}
			flipped={flipped}
		/>
	);
};

export default function Home() {
	return (
		<main class="text-center mx-auto text-gray-700 dark:text-gray-300 p-4">
			<h1 class="max-6-xs text-6xl text-sky-700 dark:text-sky-300 font-thin uppercase my-16">
				{calendar.year}
			</h1>
			<div class="grid grid-cols-3 gap-4">
				{calendar.months.map((month) => (
					<MonthView month={month} />
				))}
			</div>
		</main>
	);
}
