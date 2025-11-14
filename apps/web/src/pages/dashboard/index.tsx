import type { NextPageWithLayout } from '~/pages/_app'
import { getDashboardLayout } from '~/components/Dashboard'
import Popup from '~/components/Popup'
import DashboardView from '~/views/dashboard'

const DashboardPage: NextPageWithLayout = () => {
	return (
		<>
			<DashboardView />
			<Popup />
		</>
	)
}

DashboardPage.getLayout = (page) => getDashboardLayout(page)

export default DashboardPage
