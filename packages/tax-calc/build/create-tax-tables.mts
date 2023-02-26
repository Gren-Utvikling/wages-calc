import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { globby } from 'globby';
import { parseTables } from './parser.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist', 'tables');

const yearContent: string[] = [];
const yearLookup: string[] = [];
const yearTable: string[] = [];

const taxTableDir = path.resolve(__dirname, '..', 'tables');
for (const tables of await globby('*.txt', { cwd: taxTableDir })) {
	const filePath = path.resolve(taxTableDir, tables);
	const tablesName = path.basename(tables, '.txt');
	const tablesSource = await fs.readFile(filePath, 'utf8');
	const tablesData = parseTables(tablesSource);

	console.log(`${tablesName}: found ${tablesData.length} tables`);
	const tablesDir = path.resolve(distDir, tablesName);

	yearContent.push(
		`import * as year${tablesName} from './tables/${tablesName}.mjs';`,
		`export { year${tablesName} };`
	);
	yearLookup.push(`		case "${tablesName}":`, `			return year${tablesName};`);
	yearTable.push(`	"${tablesName}",`);

	try {
		await fs.rm(tablesDir, { recursive: true });
	} catch {}

	await fs.mkdir(tablesDir, { recursive: true });

	const indexContent: string[] = [];
	const lookupContent: string[] = [];

	for (const table of tablesData) {
		const tableFile = path.resolve(tablesDir, `${table.name}.mjs`);
		const content: string[] = [];

		indexContent.push(
			`export const monthTaxAmount${table.name} = async (salary) =>`,
			`	(await import("./${tablesName}/${table.name}.mjs")).monthTaxAmount${table.name}(salary);`
		);

		lookupContent.push(
			`		case "${table.name}":`,
			`			return monthTaxAmount${table.name}(salary);`
		);

		content.push(`export const monthTaxAmount${table.name} = (salary) => {`);
		content.push(`	if (salary < ${table.entries[0].salary}) return 0;`);
		for (let i = 1; i < table.entries.length; i++) {
			content.push(
				`  if (salary < ${table.entries[i].salary}) return ${
					table.entries[i - 1].taxAmount
				};`
			);
		}

		const lastRowIndex = table.entries.length - 1;
		const lastRow = table.entries[lastRowIndex];
		content.push(
			`  return ${lastRow.taxAmount} + ((salary - ${lastRow.salary}) * 0.54);`
		);
		content.push('};');

		const fileContent = content.join('\n') + '\n';
		await fs.writeFile(tableFile, fileContent, 'utf8');
	}

	indexContent.push(
		``,
		`export const monthTaxAmount = async (salary, table) => {`,
		`	switch (table) {`,
		...lookupContent,
		`		default:`,
		`			throw new Error("Unknown table: " + table);`,
		`	}`,
		`};`,
		``,
		`export const tables = Object.freeze([`,
		...tablesData.map((table) => `	"${table.name}",`),
		`]);`
	);

	const indexSource = indexContent.join('\n') + '\n';
	const indexFile = path.resolve(distDir, `${tablesName}.mjs`);
	await fs.writeFile(indexFile, indexSource, 'utf8');
}

yearContent.push(
	``,
	`export const year = (yearNumber) => {`,
	`	switch (yearNumber) {`,
	...yearLookup,
	`		default:`,
	`			throw new Error("Unknown year: " + yearNumber);`,
	`	}`,
	`};`,
	``,
	`export const years = Object.freeze([`,
	...yearTable,
	`]);`
);
const yearSource = yearContent.join('\n') + '\n';
const yearFile = path.resolve(distDir, '../tables.mjs');
await fs.writeFile(yearFile, yearSource, 'utf8');
