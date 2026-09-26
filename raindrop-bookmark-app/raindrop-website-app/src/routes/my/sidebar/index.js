import React, { useCallback, useMemo } from 'react'
import t from '~t'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { makeTreeFlat } from '~data/selectors/collections'

import Button from '~co/common/button'
import Icon from '~co/common/icon'
import Sidebar, { Header, Content } from '~co/screen/splitview/sidebar'
import Collections from '~co/collections/items'
import FiltersTags from './filters_tags'
import TagCloud from './tag-cloud'
import Profile from './profile'
import s from './sidebar.module.styl'

export default function PageMySidebar() {
    const { cId, search } = useParams()

    const onCreateNewCollectionClick = useCallback(e=>{
        e.preventDefault()
        
        window.dispatchEvent(
            new CustomEvent('create-new-collection', {
                detail: {
                    asChild: e.shiftKey ? true : false
                }
            })
        )
    }, [])

    let activeId = parseInt(cId)
    if (activeId=='0' && search)
        activeId = search

    const selectTree = useMemo(makeTreeFlat, [])
    const folderRows = useSelector(state => selectTree(state).length) || 1

    return (
        <Sidebar>
            <Header>
                <Profile />

                <Button 
                    title={`${t.s('createNewCollection')}\nShift+click: ${t.s('createSubFolder').toLowerCase()}`}
                    onClick={onCreateNewCollectionClick}>
                    <Icon name='add' />
                </Button>
            </Header>

            <Content className={s.body}>
                <div className={s.collections} style={{ height: `calc(var(--list-item-height) * ${folderRows})` }}>
                    <FiltersTags activeId={activeId}>
                        {(customRows, customRowRenderer)=>
                            <Collections
                                activeId={activeId}

                                customRows={customRows}
                                customRowRenderer={customRowRenderer} />
                        }
                    </FiltersTags>
                </div>
                <TagCloud activeId={activeId} />
            </Content>
        </Sidebar>
    )
}