import { useState } from 'react'
import {
	TbShoe,
	TbRollerSkating,
	TbBike,
	TbSwimming,
	TbBarbell,
	TbYoga,
	TbApple,
	TbCoffee,
	TbPizza,
	TbMeat,
	TbSalad,
	TbGlass,
	TbBottle,
	TbCookie,
	TbIceCream,
	TbBook,
	TbPencil,
	TbSchool,
	TbBulb,
	TbCertificate,
	TbPresentation,
	TbBriefcase,
	TbClock,
	TbTarget,
	TbCheckbox,
	TbCalendar,
	TbMail,
	TbPhone,
	TbHeart,
	TbUsers,
	TbMessage,
	TbGift,
	TbCash,
	TbPigMoney,
	TbChartLine,
	TbCoin,
	TbWallet,
	TbPaint,
	TbMusic,
	TbCamera,
	TbPalette,
	TbBrush,
	TbMicrophone,
	TbMoodSmile,
	TbZzz,
	TbLeaf,
	TbFlame,
	TbSun,
	TbMoon,
	TbHome,
	TbCar,
	TbPlane,
	TbWorld,
	TbMountain,
	TbBeach,
} from 'react-icons/tb'
import { HiX, HiCheck } from 'react-icons/hi'

interface IconPickerProps {
	selectedIcon?: string
	selectedColor?: string
	onSelect: (icon: string) => void
	onClose: () => void
}

const iconCategories = {
	Activities: [
		{ icon: TbShoe, name: 'TbShoe' },
		{ icon: TbRollerSkating, name: 'TbRollerSkating' },
		{ icon: TbBike, name: 'TbBike' },
		{ icon: TbSwimming, name: 'TbSwimming' },
		{ icon: TbBarbell, name: 'TbBarbell' },
		{ icon: TbYoga, name: 'TbYoga' },
		{ icon: TbTarget, name: 'TbTarget' },
		{ icon: TbFlame, name: 'TbFlame' },
	],
	'Food & Drink': [
		{ icon: TbApple, name: 'TbApple' },
		{ icon: TbCoffee, name: 'TbCoffee' },
		{ icon: TbPizza, name: 'TbPizza' },
		{ icon: TbMeat, name: 'TbMeat' },
		{ icon: TbSalad, name: 'TbSalad' },
		{ icon: TbGlass, name: 'TbGlass' },
		{ icon: TbBottle, name: 'TbBottle' },
		{ icon: TbCookie, name: 'TbCookie' },
		{ icon: TbIceCream, name: 'TbIceCream' },
	],
	Learning: [
		{ icon: TbBook, name: 'TbBook' },
		{ icon: TbPencil, name: 'TbPencil' },
		{ icon: TbSchool, name: 'TbSchool' },
		{ icon: TbBulb, name: 'TbBulb' },
		{ icon: TbCertificate, name: 'TbCertificate' },
		{ icon: TbPresentation, name: 'TbPresentation' },
	],
	Productivity: [
		{ icon: TbBriefcase, name: 'TbBriefcase' },
		{ icon: TbClock, name: 'TbClock' },
		{ icon: TbCheckbox, name: 'TbCheckbox' },
		{ icon: TbCalendar, name: 'TbCalendar' },
		{ icon: TbMail, name: 'TbMail' },
		{ icon: TbPhone, name: 'TbPhone' },
	],
	Social: [
		{ icon: TbHeart, name: 'TbHeart' },
		{ icon: TbUsers, name: 'TbUsers' },
		{ icon: TbMessage, name: 'TbMessage' },
		{ icon: TbGift, name: 'TbGift' },
	],
	Finance: [
		{ icon: TbCash, name: 'TbCash' },
		{ icon: TbPigMoney, name: 'TbPigMoney' },
		{ icon: TbChartLine, name: 'TbChartLine' },
		{ icon: TbCoin, name: 'TbCoin' },
		{ icon: TbWallet, name: 'TbWallet' },
	],
	Creativity: [
		{ icon: TbPaint, name: 'TbPaint' },
		{ icon: TbMusic, name: 'TbMusic' },
		{ icon: TbCamera, name: 'TbCamera' },
		{ icon: TbPalette, name: 'TbPalette' },
		{ icon: TbBrush, name: 'TbBrush' },
		{ icon: TbMicrophone, name: 'TbMicrophone' },
	],
	Wellness: [
		{ icon: TbMoodSmile, name: 'TbMoodSmile' },
		{ icon: TbZzz, name: 'TbZzz' },
		{ icon: TbLeaf, name: 'TbLeaf' },
		{ icon: TbSun, name: 'TbSun' },
		{ icon: TbMoon, name: 'TbMoon' },
	],
	Lifestyle: [
		{ icon: TbHome, name: 'TbHome' },
		{ icon: TbCar, name: 'TbCar' },
		{ icon: TbPlane, name: 'TbPlane' },
		{ icon: TbWorld, name: 'TbWorld' },
		{ icon: TbMountain, name: 'TbMountain' },
		{ icon: TbBeach, name: 'TbBeach' },
	],
}

export function IconPicker({
	selectedIcon,
	selectedColor = '#FDB022',
	onSelect,
	onClose,
}: IconPickerProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [tempSelected, setTempSelected] = useState(selectedIcon || 'TbTarget')

	const allIcons = Object.values(iconCategories).flat()
	const filteredIcons = searchTerm
		? allIcons.filter((item) =>
				item.name.toLowerCase().includes(searchTerm.toLowerCase()),
		  )
		: allIcons

	const handleConfirm = () => {
		onSelect(tempSelected)
		onClose()
	}

	const SelectedIconComponent =
		allIcons.find((item) => item.name === tempSelected)?.icon || TbTarget

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
						Icon
					</h2>
					<button
						onClick={handleConfirm}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiCheck className="h-5 w-5" />
					</button>
				</div>

				{/* Selected Icon Preview */}
				<div className="mb-6 flex justify-center">
					<div
						className="flex h-24 w-24 items-center justify-center rounded-3xl"
						style={{ backgroundColor: selectedColor }}
					>
						<SelectedIconComponent className="h-12 w-12 text-neutral-900" />
					</div>
				</div>

				{/* Search */}
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search"
					className="mb-6 w-full rounded-xl border border-light-300 bg-light-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-50 dark:text-dark-1000"
				/>

				{/* Icons Grid */}
				<div className="max-h-96 overflow-y-auto">
					{searchTerm ? (
						<div className="grid grid-cols-5 gap-3">
							{filteredIcons.map((item) => {
								const IconComponent = item.icon
								return (
									<button
										key={item.name}
										onClick={() => setTempSelected(item.name)}
										className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
											tempSelected === item.name
												? 'bg-blue-500 text-white'
												: 'bg-light-100 text-neutral-700 hover:bg-light-200 dark:bg-dark-200 dark:text-dark-800 dark:hover:bg-dark-300'
										}`}
									>
										<IconComponent className="h-7 w-7" />
									</button>
								)
							})}
						</div>
					) : (
						<div className="space-y-6">
							{Object.entries(iconCategories).map(([category, icons]) => (
								<div key={category}>
									<h3 className="mb-3 text-sm font-medium text-neutral-600 dark:text-dark-700">
										{category}
									</h3>
									<div className="grid grid-cols-5 gap-3">
										{icons.map((item) => {
											const IconComponent = item.icon
											return (
												<button
													key={item.name}
													onClick={() => setTempSelected(item.name)}
													className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
														tempSelected === item.name
															? 'bg-blue-500 text-white'
															: 'bg-light-100 text-neutral-700 hover:bg-light-200 dark:bg-dark-200 dark:text-dark-800 dark:hover:bg-dark-300'
													}`}
												>
													<IconComponent className="h-7 w-7" />
												</button>
											)
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
