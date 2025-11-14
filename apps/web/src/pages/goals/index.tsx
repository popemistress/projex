import type { NextPageWithLayout } from '../_app'
import { getDashboardLayout } from '~/components/Dashboard'
import Popup from '~/components/Popup'
import GoalsView from '~/views/goals'

const GoalsPage: NextPageWithLayout = () => {
	return (
		<>
			<GoalsView />
			<Popup />
		</>
	)
}

GoalsPage.getLayout = (page) => getDashboardLayout(page)

export default GoalsPage
