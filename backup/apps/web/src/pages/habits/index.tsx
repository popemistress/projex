import type { NextPageWithLayout } from '../_app'
import { getDashboardLayout } from '~/components/Dashboard'
import Popup from '~/components/Popup'
import HabitsView from '~/views/habits'

const HabitsPage: NextPageWithLayout = () => {
	return (
		<>
			<HabitsView />
			<Popup />
		</>
	)
}

HabitsPage.getLayout = (page) => getDashboardLayout(page)

export default HabitsPage
