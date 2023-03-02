import {
	createSignal,
	type Accessor,
	type Setter,
	type SignalOptions,
} from 'solid-js';

export type SignalObject<T> = {
	readonly get: Accessor<T>;
	readonly set: Setter<T>;
};

export const createSignalObject = <T extends unknown>(
	initialValue: T,
	options?: SignalOptions<T>
): SignalObject<T> => {
	const [get, set] = createSignal(initialValue, options);
	return Object.freeze({ get, set });
};
