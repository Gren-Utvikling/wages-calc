import { years } from '@grenutv/tax-calc';
import { year } from '@grenutv/dates';
import { type Temporal } from 'temporal-polyfill';
import { createMemo, createSignal, For, type JSX } from 'solid-js';
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
	readonly class?: string;
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

const CalCell = (props: CalCelProps) => {
	const rowClassName = createMemo(() => rowClass(props.row));
	const colClassName = createMemo(() => colClass(props.col));
	const classes = createMemo(() =>
		clsx(rowClassName(), colClassName(), props.class, 'p-2')
	);

	return (
		<div
			class={classes()}
			classList={props.classList}
			onClick={() => props.onClick?.()}
		>
			{props.children}
		</div>
	);
};

const DayView = (props: {
	readonly day: Temporal.PlainDate;
	readonly state: DayState;
	readonly row: number;
	readonly col: number;
}) => {
	const className = createMemo(() => {
		switch (props.state.type()) {
			case 'workday':
				return 'dark:bg-green-900';

			case 'offday':
				return 'dark:bg-red-900';

			case 'vacation':
				return 'dark:bg-blue-900';
		}
	});

	const onClick = () => props.state.value.set((v) => (v === 0 ? 7.5 : 0));

	return (
		<CalCell
			row={props.row}
			col={props.col}
			class={className()}
			onClick={onClick}
		>
			{props.state.value.get()}h
		</CalCell>
	);
};

const MonthCalendarView = (props: MonthViewProps) => {
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

	const cells = createMemo(() => {
		const weekNumbers: JSX.Element[] = [];
		const days: JSX.Element[] = [];

		if (props.month.days[0].day.dayOfWeek !== 1) {
			weekNumbers.push(
				<CalCell row={1} col={0} class="dark:bg-orange-900">
					{props.month.days[0].day.weekOfYear}
				</CalCell>
			);
		}

		let row = 1;
		for (const day of props.month.days) {
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

		return [...weekNumbers, ...days];
	});

	return (
		<div class="grid grid-cols-8">
			{headings}
			{cells()}
		</div>
	);
};

type MonthViewProps = {
	readonly month: MonthState;
};

const MonthProp = (props: {
	readonly name: string;
	readonly value: JSX.Element;
}) => (
	<>
		<dt class="text-sm text-sky-500 dark:text-sky-400 font-medium">
			{props.name}
		</dt>
		<dd class="text-2xl text-sky-700 dark:text-sky-300 font-thin">
			{props.value}
		</dd>
	</>
);

const MonthWageView = (props: MonthViewProps) => {
	return (
		<div>
			<dl>
				<MonthProp name="Total days" value={props.month.days.length} />
				<MonthProp name="Total workdays" value={props.month.workDays()} />
				<MonthProp name="Total off days" value={props.month.offDays()} />
				<MonthProp
					name="Total vacation days"
					value={props.month.vacationDays()}
				/>
				<MonthProp name="Total hours" value={props.month.totalHours()} />
			</dl>
		</div>
	);
};

const MonthNameDisplay = (props: MonthViewProps) => {
	return (
		<h2 class="text-2xl text-sky-700 dark:text-sky-300 font-thin uppercase my-4">
			{monthName(props.month)}
		</h2>
	);
};

type MonthViewSideProps = MonthViewProps & {
	readonly onFlip: () => void;
};

const MonthViewFront = (props: MonthViewSideProps) => {
	const onClick = () => props.onFlip();

	return (
		<>
			<MonthNameDisplay month={props.month} />
			<FlipButton onClick={onClick} />
			<MonthWageView month={props.month} />
		</>
	);
};

const MonthViewBack = (props: MonthViewSideProps) => {
	const onClick = () => props.onFlip();

	return (
		<>
			<MonthNameDisplay month={props.month} />
			<FlipButton onClick={onClick} />
			<MonthCalendarView month={props.month} />
		</>
	);
};

const MonthView = (props: MonthViewProps) => {
	const [flipped, setFlipped] = createSignal(false);
	const flip = () => {
		setFlipped((v) => !v);
	};

	return (
		<FlipCard
			front={<MonthViewFront month={props.month} onFlip={flip} />}
			back={<MonthViewBack month={props.month} onFlip={flip} />}
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
				<For each={state.months}>{(month) => <MonthView month={month} />}</For>
			</div>
		</main>
	);
}
