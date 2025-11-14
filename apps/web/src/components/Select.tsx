import { forwardRef } from 'react'
import { TbChevronDown } from 'react-icons/tb'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	error?: string
	icon?: React.ReactNode
	helperText?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, icon, helperText, className = '', children, ...props }, ref) => {
		return (
			<div className="w-full">
				{label && (
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						{label}
					</label>
				)}
				<div className="relative">
					{/* Icon */}
					{icon && (
						<div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-dark-700">
							{icon}
						</div>
					)}

					{/* Select */}
					<select
						ref={ref}
						className={`
							w-full appearance-none rounded-lg border border-light-300 bg-white
							${icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5
							text-sm text-neutral-900
							transition-colors
							hover:border-light-400
							focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
							disabled:cursor-not-allowed disabled:opacity-50
							dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000
							dark:hover:border-dark-500
							dark:focus:border-blue-500
							${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
							${className}
						`}
						style={{
							backgroundImage: 'none',
							WebkitAppearance: 'none',
							MozAppearance: 'none',
						}}
						{...props}
					>
						{children}
					</select>

					{/* Dropdown Arrow */}
					<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
						<TbChevronDown className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
					</div>
				</div>

				{/* Helper Text or Error */}
				{(helperText || error) && (
					<p
						className={`mt-1 text-xs ${
							error
								? 'text-red-600 dark:text-red-400'
								: 'text-neutral-600 dark:text-dark-700'
						}`}
					>
						{error || helperText}
					</p>
				)}
			</div>
		)
	},
)

Select.displayName = 'Select'

export default Select
