import React, { useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { load } from '~data/actions/filters'
import { getQuickFilters } from '~data/selectors/filters'

import FiltersSection from '~co/filters/section'
import Filter from '~co/filters/item'

export default function MySidebarFiltersTags({ children, activeId }) {
    const dispatch = useDispatch()

    //load
    useEffect(()=>{dispatch(load('global'))}, [])

    //data
    const { filters_hide } = useSelector(state=>state.config)
    const filters = useSelector(state=>getQuickFilters(state, 'global'))

    const data = useMemo(()=>[
        ...(filters.length ? [
            { _id: 'filters', hidden: filters_hide },
            ...(!filters_hide ? filters.map(filter=>({ ...filter, type: 'filter' })) : [])
        ] : [])
    ], [filters, filters_hide])

    //item render
    const rowRenderer = useCallback((row={})=>{
        let Component
        let active = false

        switch(row.type || row._id) {
            case 'filters': 
                Component = FiltersSection
                break

            case 'filter':
                Component = Filter
                active = activeId == (row.query||'').trim()
                break

            default: return false
        }

        return (
            <Component 
                item={row}
                active={active} />
        )
    }, [activeId])

    return children(
        data,
        rowRenderer
    )
}