import { useState } from 'react'
import { HiX, HiCheck } from 'react-icons/hi'
import { TbTarget } from 'react-icons/tb'

interface ColorPickerProps {
	selectedColor?: string
	selectedIcon?: string
	onSelect: (color: string) => void
	onClose: () => void
}

const presetColors = [
	'#FF9F66', // Orange
	'#A8E063', // Green
	'#5DADE2', // Blue
	'#BB8FCE', // Purple
	'#F1948A', // Red
	'#F9E79F', // Beige
	'#F4D03F', // Yellow
	'#ABEBC6', // Mint
	'#76D7C4', // Teal
	'#7FB3D5', // Cyan
	'#AED6F1', // Sky
	'#D7BDE2', // Lavender
	'#F8B4D9', // Pink
	'#F5B7B1', // Rose
]

export function ColorPicker({
	selectedColor = '#FDB022',
	selectedIcon = 'TbTarget',
	onSelect,
	onClose,
}: ColorPickerProps) {
	const [tempColor, setTempColor] = useState(selectedColor)
	const [hue, setHue] = useState(30)

	const handleConfirm = () => {
		onSelect(tempColor)
		onClose()
	}

	const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newHue = parseInt(e.target.value)
		setHue(newHue)
		// Convert HSL to hex
		const hex = hslToHex(newHue, 70, 60)
		setTempColor(hex)
	}

	// Helper function to convert HSL to Hex
	function hslToHex(h: number, s: number, l: number): string {
		l /= 100
		const a = (s * Math.min(l, 1 - l)) / 100
		const f = (n: number) => {
			const k = (n + h / 30) % 12
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0')
		}
		return `#${f(0)}${f(8)}${f(4)}`
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-100">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiX className="h-5 w-5" />
					</button>
					<h2 className="text-xl font-semibold text-neutral-900 dark:text-dark-1000">
						Color
					</h2>
					<button
						onClick={handleConfirm}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiCheck className="h-5 w-5" />
					</button>
				</div>

				{/* Selected Color Preview */}
				<div className="mb-6 flex justify-center">
					<div
						className="flex h-24 w-24 items-center justify-center rounded-3xl"
						style={{ backgroundColor: tempColor }}
					>
						<TbTarget className="h-12 w-12 text-neutral-900" />
					</div>
				</div>

				{/* Preset Colors */}
				<div className="mb-6 grid grid-cols-7 gap-3">
					{presetColors.map((color) => (
						<button
							key={color}
							onClick={() => setTempColor(color)}
							className={`h-16 w-16 rounded-3xl transition-all ${
								tempColor === color ? 'ring-4 ring-blue-500 ring-offset-2' : ''
							}`}
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				{/* Gradient Picker */}
				<div className="mb-4 h-48 rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-700 p-4">
					<div className="flex h-full items-center justify-center">
						<div
							className="h-12 w-12 rounded-full border-4 border-white shadow-lg"
							style={{ backgroundColor: tempColor }}
						/>
					</div>
				</div>

				{/* Hue Slider */}
				<div className="relative">
					<input
						type="range"
						min="0"
						max="360"
						value={hue}
						onChange={handleHueChange}
						className="h-8 w-full cursor-pointer appearance-none rounded-full"
						style={{
							background:
								'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
						}}
					/>
					<div
						className="pointer-events-none absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-4 border-white shadow-lg"
						style={{
							left: `calc(${(hue / 360) * 100}% - 20px)`,
							backgroundColor: hslToHex(hue, 70, 60),
						}}
					/>
				</div>
			</div>
		</div>
	)
}
