import { years } from '@grenutv/tax-calc';
import { year } from '@grenutv/dates';
import { type Temporal } from 'temporal-polyfill';
import { Accessor, createMemo, createSignal, type JSX } from 'solid-js';
import { FlipButton, FlipCard } from '~/components/FlipCard';
import { clsx } from 'clsx';
import { DayState, MonthState, createYearState } from '~/state/calendar.js';

const currentYear = years[years.length - 1];
const calendar = await year(currentYear);

const monthNames = (() => {
	const format = new Intl.DateTimeFormat('en', { month: 'long' }).format;
	return calendar.months.map((m) =>
		format(new Date(Date.UTC(2021, m.month.month - 1)))
	);
})();

const monthName = (month: MonthState) => {
	return monthNames[month.month.month - 1];
};

type CalCelProps = {
	readonly children: JSX.Element;
	readonly class?: Accessor<string>;
	readonly classList?: {
		readonly [k: string]: boolean | undefined;
	};
	readonly row: number;
	readonly col: number;
	readonly onClick?: () => void;
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
	onClick,
}: CalCelProps) => {
	const rowClassName = rowClass(row);
	const colClassName = colClass(col);
	const classes = createMemo(() => {
		const input = typeof className === 'function' ? className() : className;
		return clsx(rowClassName, colClassName, input, 'p-2');
	});

	return (
		<div class={classes()} classList={classList} onClick={onClick}>
			{children}
		</div>
	);
};

const DayView = ({
	day,
	state,
	row,
	col,
}: {
	readonly day: Temporal.PlainDate;
	readonly state: DayState;
	readonly row: number;
	readonly col: number;
}) => {
	const className = createMemo(() => {
		switch (state.type()) {
			case 'workday':
				return 'dark:bg-green-900';

			case 'offday':
				return 'dark:bg-red-900';

			case 'vacation':
				return 'dark:bg-blue-900';
		}
	});

	return (
		<CalCell
			row={row}
			col={col}
			class={className}
			onClick={() => {
				state.value.set(state.value.get() === 0 ? 7.5 : 0);
			}}
		>
			{state.value.get()}h
		</CalCell>
	);
};

const MonthCalendarView = ({ month }: MonthViewProps) => {
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
			<DayView row={row} col={day.day.dayOfWeek} day={day.day} state={day} />
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
	readonly month: MonthState;
};

const MonthWageView = ({ month }: MonthViewProps) => {
	return (
		<div>
			<dl>
				<dt class="text-sm text-sky-500 dark:text-sky-400 font-medium">
					Total days
				</dt>
				<dd class="text-2xl text-sky-700 dark:text-sky-300 font-thin">
					{month.days.length}
				</dd>

				<dt class="text-sm text-sky-500 dark:text-sky-400 font-medium">
					Total workdays
				</dt>
				<dd class="text-2xl text-sky-700 dark:text-sky-300 font-thin">
					{month.workDays()}
				</dd>

				<dt class="text-sm text-sky-500 dark:text-sky-400 font-medium">
					Total off days
				</dt>
				<dd class="text-2xl text-sky-700 dark:text-sky-300 font-thin">
					{month.offDays()}
				</dd>

				<dt class="text-sm text-sky-500 dark:text-sky-400 font-medium">
					Total vaccation days
				</dt>
				<dd class="text-2xl text-sky-700 dark:text-sky-300 font-thin">
					{month.vacationDays()}
				</dd>

				<dt class="text-sm text-sky-500 dark:text-sky-400 font-medium">
					Total hours
				</dt>
				<dd class="text-2xl text-sky-700 dark:text-sky-300 font-thin">
					{month.totalHours()}
				</dd>
			</dl>
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

const MonthView = ({ month }: MonthViewProps) => {
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
	const state = createYearState(calendar);

	return (
		<main class="text-center mx-auto text-gray-700 dark:text-gray-300 p-4">
			<h1 class="max-6-xs text-6xl text-sky-700 dark:text-sky-300 font-thin uppercase my-16">
				{state.year}
			</h1>
			<div class="grid grid-cols-3 gap-4">
				{state.months.map((month) => (
					<MonthView month={month} />
				))}
			</div>
		</main>
	);
}
