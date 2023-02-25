export type Table = {
	readonly name: string;
	readonly entries: readonly Entry[];
};

export type Entry = {
	readonly salary: string;
	readonly taxAmount: string;
};

type MutableTable = {
	name: string;
	entries: Entry[];
};

export const parseTables = (text: string): readonly Table[] => {
	const lines = text.split("\n");
	const tables = [];
	let table: MutableTable | null = null;

	for (const line of lines) {
		if (line === "") {
			continue;
		}

		const tableName = line.substring(0, 4);
		const period = line.substring(4, 5);
		const type = line.substring(5, 6);
		const salary = line.substring(6, 11).replace(/^0+/, "") || "0";
		const taxAmount = line.substring(11, 16).replace(/^0+/, "") || "0";

		if (table === null || table.name !== tableName) {
			if (table !== null && table.entries.length === 0) {
				tables.splice(tables.length - 1, 1);
			}

			table = {
				name: tableName,
				entries: [],
			};

			tables.push(table);
		}

		if (period === "1" && type === "0") {
			table.entries.push(Object.freeze({ salary, taxAmount }));
		}
	}

	return Object.freeze(tables.map((table) => Object.freeze(table)));
};
