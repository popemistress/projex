import type { NextPageWithLayout } from '../_app'
import { getDashboardLayout } from '~/components/Dashboard'
import Popup from '~/components/Popup'
import GoalDetailView from '~/views/goals/detail'

const GoalDetailPage: NextPageWithLayout = () => {
	return (
		<>
			<GoalDetailView />
			<Popup />
		</>
	)
}

GoalDetailPage.getLayout = (page) => getDashboardLayout(page)

export default GoalDetailPage
