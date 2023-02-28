import { years } from '@grenutv/tax-calc';
import { type CalendarMonth, year } from '@grenutv/dates';
import { type Temporal } from 'temporal-polyfill';
import { type Accessor, createSignal, type JSX } from 'solid-js';
import { FlipButton, FlipCard } from '~/components/FlipCard';
import { clsx } from 'clsx';

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

type CalCelProps = {
	readonly children: JSX.Element;
	readonly class?: string;
	readonly classList?: {
		readonly [k: string]: boolean | undefined;
	};
	readonly row: number;
	readonly col: number;
};

const rowClass = (row: number) => {
	switch (row) {
		case 0:
			return 'row-start-1';
		case 1:
			return 'row-start-2';
		case 2:
			return 'row-start-3';
		case 3:
			return 'row-start-4';
		case 4:
			return 'row-start-5';
		case 5:
			return 'row-start-6';
		case 6:
			return 'row-start-7';
	}
};

const colClass = (col: number) => {
	switch (col) {
		case 0:
			return 'col-start-1';
		case 1:
			return 'col-start-2';
		case 2:
			return 'col-start-3';
		case 3:
			return 'col-start-4';
		case 4:
			return 'col-start-5';
		case 5:
			return 'col-start-6';
		case 6:
			return 'col-start-7';
		case 7:
			return 'col-start-8';
	}
};

const CalCell = ({
	children,
	class: className,
	classList,
	row,
	col,
}: CalCelProps) => {
	const rowClassName = rowClass(row);
	const colClassName = colClass(col);
	const classes = clsx(rowClassName, colClassName, className, 'p-2');

	return (
		<div class={classes} classList={classList}>
			{children}
		</div>
	);
};

const DayView = ({
	day,
	type,
	row,
	col,
}: {
	readonly day: Temporal.PlainDate;
	readonly type: Accessor<'workday' | 'offday' | 'vacation'>;
	readonly row: number;
	readonly col: number;
}) => {
	return (
		<CalCell
			row={row}
			col={col}
			classList={{
				'dark:bg-green-900': type() === 'workday',
				'dark:bg-red-900': type() === 'offday',
				'dark:bg-blue-900': type() === 'vacation',
			}}
		>
			{day.day}
		</CalCell>
	);
};

const MonthCalendarView = ({ month }: { readonly month: CalendarMonth }) => {
	const firstDay = month.days[0].day;
	const headings: JSX.Element[] = [
		<CalCell row={0} col={0} class="dark:bg-orange-900">
			Wk
		</CalCell>,
		<CalCell row={0} col={1}>
			Mo
		</CalCell>,
		<CalCell row={0} col={2}>
			Tu
		</CalCell>,
		<CalCell row={0} col={3}>
			We
		</CalCell>,
		<CalCell row={0} col={4}>
			Th
		</CalCell>,
		<CalCell row={0} col={5}>
			Fr
		</CalCell>,
		<CalCell row={0} col={6}>
			Sa
		</CalCell>,
		<CalCell row={0} col={7}>
			Su
		</CalCell>,
	];

	const weekNumbers: JSX.Element[] = [];
	const days: JSX.Element[] = [];

	if (month.days[0].day.dayOfWeek !== 1) {
		weekNumbers.push(
			<CalCell row={1} col={0} class="dark:bg-orange-900">
				{month.days[0].day.weekOfYear}
			</CalCell>
		);
	}

	let row = 1;
	for (const day of month.days) {
		if (day.day.dayOfWeek === 1) {
			row = row + 1;
			weekNumbers.push(
				<CalCell row={row} col={0} class="dark:bg-orange-900">
					{day.day.weekOfYear}
				</CalCell>
			);
		}

		days.push(
			<DayView
				row={row}
				col={day.day.dayOfWeek}
				day={day.day}
				type={() => day.type}
			/>
		);
	}

	return (
		<div class="grid grid-cols-8">
			{headings}
			{weekNumbers}
			{days}
		</div>
	);
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

const MonthNameDisplay = ({ month }: MonthViewProps) => {
	return (
		<h2 class="text-2xl text-sky-700 dark:text-sky-300 font-thin uppercase my-4">
			{monthName(month)}
		</h2>
	);
};

type MonthViewSideProps = MonthViewProps & {
	readonly onFlip: () => void;
};

const MonthViewFront = ({ month, onFlip }: MonthViewSideProps) => {
	return (
		<>
			<MonthNameDisplay month={month} />
			<FlipButton onClick={onFlip} />
			<MonthWageView month={month} />
		</>
	);
};

const MonthViewBack = ({ month, onFlip }: MonthViewSideProps) => {
	return (
		<>
			<MonthNameDisplay month={month} />
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
