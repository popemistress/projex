import type { NextPageWithLayout } from '../_app'
import { getDashboardLayout } from '~/components/Dashboard'
import Popup from '~/components/Popup'
import HabitDetailView from '~/views/habits/HabitDetailView'

const HabitDetailPage: NextPageWithLayout = () => {
	return (
		<>
			<HabitDetailView />
			<Popup />
		</>
	)
}

HabitDetailPage.getLayout = (page) => getDashboardLayout(page)

export default HabitDetailPage
