import React from 'react'
import { Outlet } from 'react-router-dom'
import SplitView from '~co/screen/splitview'

import Sidebar from './sidebar'
import OfflineBanner from './offline-bar'
// import OnboardUpgrade from './onboard-upgrade'

export default function PageMyLayout() {
    return (
        <>
            {process.env.CONNECT_LOCAL == '1' ? <OfflineBanner /> : null}
            <SplitView>
                <Sidebar />
                <Outlet />
                {/* <OnboardUpgrade /> */}
            </SplitView>
        </>
    )
}