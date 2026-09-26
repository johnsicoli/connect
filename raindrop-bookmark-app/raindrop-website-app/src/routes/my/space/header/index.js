import React, { useCallback, useMemo } from 'react'
import { Header } from '~co/screen/splitview/main'
import { Space } from '~co/common/header'
import Search from '~co/search'
import { useNavigate } from 'react-router-dom'
import { target, environment } from '~target'

import Share from './share'
import { SyncButton } from '../../offline-bar'

export default function PageMySpaceHeader(params) {
    const navigate = useNavigate()
    const { cId, search, fromCid } = params

    const onSubmit = useCallback(params=>{
        if ((search||'').trim() != (params.search||'').trim() ||
            cId != params._id)
            if (params.search)
                navigate(`/my/${params._id}/${encodeURIComponent(params.search)}/${(parseInt(cId) ? parseInt(cId) : fromCid)||''}`)
            else
                navigate(`/my/${params._id}`)
    }, [navigate, cId, search, fromCid])

    const events = useMemo(()=>({ onSubmit }), [onSubmit])

    return (
        <Header>
            <Search 
                autoFocus={target=='extension' && !environment.includes('safari-ios')}
                spaceId={cId}
                value={search}
                events={events} />

            <Space />

            <Share {...params} />
            {process.env.CONNECT_LOCAL == '1' ? <SyncButton /> : null}
        </Header>
    )
}