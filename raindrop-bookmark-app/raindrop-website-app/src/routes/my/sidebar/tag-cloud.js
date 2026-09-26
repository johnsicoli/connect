import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { load } from '~data/actions/filters'
import { getTags } from '~data/selectors/tags'
import { compact } from '~modules/format/number'
import s from './tag-cloud.module.styl'

export default function TagCloud({ activeId }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const tags = useSelector(state => getTags(state, 'global'))

    useEffect(() => { dispatch(load('global')) }, [dispatch])

    if (!tags.length) return null

    return (
        <div className={s.cloud}>
            <div className={s.label}>Tags</div>
            <div className={s.pills}>
                {tags.map(tag => {
                    const query = (tag.query || '').trim()
                    const active = activeId == query || activeId == ('#' + tag._id)
                    return (
                        <button
                            key={tag._id}
                            type='button'
                            className={active ? s.active : s.pill}
                            onClick={() => navigate(`/my/0/${encodeURIComponent(query)}`)}>
                            {tag._id}
                            {tag.count ? <span className={s.count}>{compact(tag.count)}</span> : null}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
