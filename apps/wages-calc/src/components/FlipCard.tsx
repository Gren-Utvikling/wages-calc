import type { Accessor, JSX } from 'solid-js';

export type FlipCardProps = {
	readonly front: JSX.Element;
	readonly back: JSX.Element;
	readonly flipped: Accessor<boolean>;
};

const side =
	'col-start-1 row-start-1 border border-gray-700 dark:border-gray-300 m-2 p-2 rounded backface-hidden transition-transform duration-700 relative';

export const FlipCard = ({ front, back, flipped }: FlipCardProps) => {
	return (
		<div class="grid grid-cols-1 grid-rows-1">
			<div class={side} classList={{ flipped: flipped() }}>
				{front}
			</div>
			<div class={`${side} backface`} classList={{ flipped: flipped() }}>
				{back}
			</div>
		</div>
	);
};

export type FlipButtonProps = {
	onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};

export const FlipButton = ({ onClick }: FlipButtonProps) => {
	return (
		<button
			class="absolute top-0 right-0 m-2 p-2 material-symbols-outlined"
			onClick={onClick}
			type="button"
		>
			replay
		</button>
	);
};
