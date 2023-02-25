declare const _year: unique symbol;
export declare type Year = string & { [_year]: never };

declare const _tableName: unique symbol;
export declare type TableName = string & { [_tableName]: never };

export declare type TaxTables = {
	readonly tables: readonly TableName[];
	readonly monthTaxAmount: (salary: number, table: TableName) => number;
};

export declare const years: readonly Year[];
export declare const year: (year: Year) => TaxTables;
