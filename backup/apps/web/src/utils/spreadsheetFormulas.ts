import type { SpreadsheetData } from '~/types/file'

export class FormulaEngine {
	/**
	 * Evaluate a formula
	 */
	evaluate(formula: string, data: SpreadsheetData): any {
		if (!formula.startsWith('=')) {
			return formula
		}

		try {
			const expression = formula.substring(1).trim()
			return this.parseExpression(expression, data)
		} catch (error) {
			console.error('Formula error:', error)
			return '#ERROR!'
		}
	}

	/**
	 * Parse and evaluate expression
	 */
	private parseExpression(expression: string, data: SpreadsheetData): any {
		// Check for functions
		const functionMatch = expression.match(/^(\w+)\((.*)\)$/)
		if (functionMatch) {
			const [, funcName, args] = functionMatch
			if (!funcName || args === undefined) return '#ERROR!'
			return this.evaluateFunction(funcName.toUpperCase(), args, data)
		}

		// Check for cell reference
		if (this.isCellReference(expression)) {
			return this.getCellValue(expression, data)
		}

		// Check for range
		if (this.isRange(expression)) {
			return this.getRange(expression, data)
		}

		// Try to evaluate as number
		const num = parseFloat(expression)
		if (!isNaN(num)) {
			return num
		}

		// Return as string
		return expression
	}

	/**
	 * Evaluate a function
	 */
	private evaluateFunction(
		funcName: string,
		args: string,
		data: SpreadsheetData
	): any {
		const argList = this.parseArguments(args, data)

		switch (funcName) {
			case 'SUM':
				return this.sum(argList)
			case 'AVERAGE':
			case 'AVG':
				return this.average(argList)
			case 'COUNT':
				return this.count(argList)
			case 'MIN':
				return this.min(argList)
			case 'MAX':
				return this.max(argList)
			case 'IF':
				return this.if(argList)
			case 'CONCAT':
				return this.concat(argList)
			case 'UPPER':
				return this.upper(argList)
			case 'LOWER':
				return this.lower(argList)
			case 'LEN':
				return this.len(argList)
			case 'ROUND':
				return this.round(argList)
			default:
				return '#NAME?'
		}
	}

	/**
	 * Parse function arguments
	 */
	private parseArguments(args: string, data: SpreadsheetData): any[] {
		const argList: any[] = []
		const parts = args.split(',')

		for (const part of parts) {
			const trimmed = part.trim()

			if (this.isRange(trimmed)) {
				argList.push(...this.getRange(trimmed, data))
			} else if (this.isCellReference(trimmed)) {
				argList.push(this.getCellValue(trimmed, data))
			} else {
				const num = parseFloat(trimmed)
				argList.push(isNaN(num) ? trimmed.replace(/['"]/g, '') : num)
			}
		}

		return argList
	}

	/**
	 * Check if string is a cell reference (e.g., A1, B2)
	 */
	private isCellReference(ref: string): boolean {
		return /^[A-Z]+\d+$/.test(ref)
	}

	/**
	 * Check if string is a range (e.g., A1:A10)
	 */
	private isRange(ref: string): boolean {
		return /^[A-Z]+\d+:[A-Z]+\d+$/.test(ref)
	}

	/**
	 * Get cell value
	 */
	getCellValue(ref: string, data: SpreadsheetData): any {
		const { row, col } = this.parseCellReference(ref)
		return data[row]?.[col]?.value ?? ''
	}

	/**
	 * Get range of values
	 */
	getRange(range: string, data: SpreadsheetData): any[] {
		const [start, end] = range.split(':')
		if (!start || !end) return []
		const startPos = this.parseCellReference(start)
		const endPos = this.parseCellReference(end)

		const values: any[] = []

		for (let row = startPos.row; row <= endPos.row; row++) {
			for (let col = startPos.col; col <= endPos.col; col++) {
				const value = data[row]?.[col]?.value
				if (value !== undefined && value !== '') {
					values.push(value)
				}
			}
		}

		return values
	}

	/**
	 * Parse cell reference to row/col
	 */
	private parseCellReference(ref: string): { row: number; col: number } {
		const match = ref.match(/^([A-Z]+)(\d+)$/)
		if (!match) throw new Error('Invalid cell reference')

		const [, colStr, rowStr] = match
		if (!colStr || !rowStr) throw new Error('Invalid cell reference')
		const col = this.columnToIndex(colStr)
		const row = parseInt(rowStr) - 1

		return { row, col }
	}

	/**
	 * Convert column letter to index (A=0, B=1, etc.)
	 */
	private columnToIndex(col: string): number {
		let index = 0
		for (let i = 0; i < col.length; i++) {
			index = index * 26 + (col.charCodeAt(i) - 64)
		}
		return index - 1
	}

	/**
	 * Convert index to column letter (0=A, 1=B, etc.)
	 */
	columnToLetter(index: number): string {
		let letter = ''
		let num = index + 1

		while (num > 0) {
			const remainder = (num - 1) % 26
			letter = String.fromCharCode(65 + remainder) + letter
			num = Math.floor((num - 1) / 26)
		}

		return letter
	}

	// Formula functions
	private sum(values: any[]): number {
		return values.reduce((acc, val) => acc + (parseFloat(val) || 0), 0)
	}

	private average(values: any[]): number {
		if (values.length === 0) return 0
		return this.sum(values) / values.length
	}

	private count(values: any[]): number {
		return values.filter(v => v !== '' && v !== null && v !== undefined).length
	}

	private min(values: any[]): number {
		const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n))
		return numbers.length > 0 ? Math.min(...numbers) : 0
	}

	private max(values: any[]): number {
		const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n))
		return numbers.length > 0 ? Math.max(...numbers) : 0
	}

	private if(args: any[]): any {
		if (args.length < 3) return '#VALUE!'
		const [condition, trueValue, falseValue] = args
		return condition ? trueValue : falseValue
	}

	private concat(args: any[]): string {
		return args.join('')
	}

	private upper(args: any[]): string {
		return String(args[0] || '').toUpperCase()
	}

	private lower(args: any[]): string {
		return String(args[0] || '').toLowerCase()
	}

	private len(args: any[]): number {
		return String(args[0] || '').length
	}

	private round(args: any[]): number {
		if (args.length < 1) return 0
		const num = parseFloat(args[0])
		const decimals = args[1] !== undefined ? parseInt(args[1]) : 0
		return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
	}
}

// Export singleton instance
export const formulaEngine = new FormulaEngine()
