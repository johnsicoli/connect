import s from './view.module.styl'
import React from 'react'
import t from '~t'
import { compact } from '~modules/format/number'

import { Item, ItemTitle, ItemInfo, ItemActions } from '~co/common/list'
import Button from '~co/common/button'
import Icon from '~co/common/icon'
import SuperLink from '~co/common/superLink'
import TagIcon from './icon'

export default class TagsItemView extends React.Component {
    render() {
        const {
            active,
            item: { _id, count, isNew, query },
            showIcon=true, focusable,
            onRenameClick,
            oneRename, onRenameCancel, onContextMenuClose, onRemoveClick, onRename, oneRemove, //to ignore
            ...etc
        } = this.props

        return (
            <Item
                onDoubleClick={onRenameClick}
                {...etc}
                className={s.item}
                active={active}>
                <span className={s.pill}>
                    {showIcon ? <TagIcon /> : null}
                    <span className={s.name}>{_id}</span>
                    {count ? <span className={s.count}>{compact(count)}</span> : null}
                    {isNew ? <span className={s.count}>{t.s('newTag')}</span> : null}
                </span>
                {etc.onContextMenu ? (
                    <ItemActions>
                        <Button
                            title={t.s('more')}
                            onClick={etc.onContextMenu}>
                            <Icon name='more_horizontal' />
                        </Button>
                    </ItemActions>
                ) : null}

                {focusable && (
                    <SuperLink 
                        to={`/my/0/${encodeURIComponent(query.trim())}`}
                        tabIndex='0'/>
                )}
            </Item>
        )
    }
}