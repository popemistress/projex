import { HiOutlineCheckCircle, HiOutlineFire, HiOutlineChartBar, HiOutlineClock } from 'react-icons/hi2'

interface Habit {
	status: string
	streakCount: number
	totalCompletions: number
}

interface HabitsStatsProps {
	habits?: Habit[]
}

export function HabitsStats({ habits = [] }: HabitsStatsProps) {
	const totalHabits = habits.length
	const activeHabits = habits.filter((h) => h.status === 'active').length
	const averageStreak =
		habits.length > 0
			? Math.round(habits.reduce((sum, h) => sum + h.streakCount, 0) / habits.length)
			: 0
	const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0)

	const stats = [
		{
			label: 'Total Habits',
			value: totalHabits,
			icon: HiOutlineCheckCircle,
			color: 'text-blue-600 dark:text-blue-400',
			bgColor: 'bg-blue-100 dark:bg-blue-900/20',
		},
		{
			label: 'Active',
			value: activeHabits,
			icon: HiOutlineClock,
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-100 dark:bg-green-900/20',
		},
		{
			label: 'Avg Streak',
			value: `${averageStreak} days`,
			icon: HiOutlineFire,
			color: 'text-orange-600 dark:text-orange-400',
			bgColor: 'bg-orange-100 dark:bg-orange-900/20',
		},
		{
			label: 'Completions',
			value: totalCompletions,
			icon: HiOutlineChartBar,
			color: 'text-purple-600 dark:text-purple-400',
			bgColor: 'bg-purple-100 dark:bg-purple-900/20',
		},
	]

	return (
		<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="rounded-lg border border-light-300 bg-white p-4 dark:border-dark-400 dark:bg-dark-100"
				>
					<div className="flex items-center gap-3">
						<div className={`rounded-lg p-2 ${stat.bgColor}`}>
							<stat.icon className={`h-5 w-5 ${stat.color}`} />
						</div>
						<div>
							<p className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
								{stat.value}
							</p>
							<p className="text-sm text-neutral-600 dark:text-dark-700">
								{stat.label}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
