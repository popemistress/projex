import type { NextPageWithLayout } from '~/pages/_app'
import { getDashboardLayout } from '~/components/Dashboard'
import Popup from '~/components/Popup'
import TrackingView from '~/views/tracking'

const TrackingPage: NextPageWithLayout = () => {
	return (
		<>
			<TrackingView />
			<Popup />
		</>
	)
}

TrackingPage.getLayout = (page) => getDashboardLayout(page)

export default TrackingPage
