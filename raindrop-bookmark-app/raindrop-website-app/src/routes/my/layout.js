import React from 'react'
import { Outlet } from 'react-router-dom'
import SplitView from '~co/screen/splitview'

import Sidebar from './sidebar'
import OfflineBar from './offline-bar'
// import OnboardUpgrade from './onboard-upgrade'

export default function PageMyLayout() {
    return (
        <SplitView>
            <Sidebar />
            {process.env.CONNECT_LOCAL == '1' ? <OfflineBar /> : null}
            <Outlet />
            {/* <OnboardUpgrade /> */}
        </SplitView>
    )
}