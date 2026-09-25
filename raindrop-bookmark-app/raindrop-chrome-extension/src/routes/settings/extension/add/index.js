import React, { useEffect, useState } from 'react'
import t from '~t'
import { connect } from 'react-redux'
import { set } from '~data/actions/config'
import { target } from '~target'
import browser from '~target/extension/browser'
import { STORAGE_KEY } from '~target/extension/invisibleSaveKey'

import { Title, Label, Radio, Checkbox, Layout, SubLabel } from '~co/common/form'
import Icon from '~co/common/icon'
import CollectionIcon from '~co/collections/item/icon'

function InvisibleSave() {
    const [on, setOn] = useState(false)

    useEffect(()=>{
        let stop = false
        browser.storage.local.get(STORAGE_KEY).then(stored=>{
            if (!stop) setOn(stored[STORAGE_KEY] === true)
        }).catch(()=>{})

        function onChanged(changes, area) {
            if (area == 'local' && changes[STORAGE_KEY])
                setOn(changes[STORAGE_KEY].newValue === true)
        }
        browser.storage.onChanged.addListener(onChanged)
        return ()=>{
            stop = true
            browser.storage.onChanged.removeListener(onChanged)
        }
    }, [])

    return (
        <>
            <Checkbox
                checked={on}
                onChange={()=>{
                    const next = !on
                    setOn(next)
                    browser.storage.local.set({ [STORAGE_KEY]: next })
                }}>
                {t.s('invisibleSave')}
            </Checkbox>
            <SubLabel>{t.s('invisibleSaveD')}</SubLabel>
        </>
    )
}

function SettingsExtensionAdd({ add_default_collection, add_auto_save, browser_extension_mode, set }) {
    if (browser_extension_mode != 'clipper')
        return null

    return (
        <>
            <Title>
                {t.s('clipperSettings')}
            </Title>

            <Layout type='grid'>
                <Label>
                    {t.s('newBookmark')}
                </Label>
                <div>
                    <Checkbox 
                        checked={add_auto_save}
                        onChange={()=>set('add_auto_save', !add_auto_save)}>
                        {t.s('saveAutomatically')}
                    </Checkbox>
                    {target == 'extension' && <InvisibleSave />}
                </div>

                <Label>
                    {t.s('defaultCollection')}
                </Label>
                <div>
                    {[
                        [-1, t.s('defaultCollection--1'), <CollectionIcon _id={-1} />],
                        [0, t.s('lastUsed'), <Icon name='sort_-created' />]
                    ].map(([key, title, icon])=>
                        <Radio 
                            key={key}
                            checked={add_default_collection==key}
                            name='add_default_collection'
                            onChange={e=>set('add_default_collection', key)}>
                            {icon}
                            {title}
                        </Radio>
                    )}
                </div>
            </Layout>
        </>
    )
}

export default connect(
    ({ config: { add_default_collection, add_auto_save, browser_extension_mode } })=>({
        add_default_collection, add_auto_save, browser_extension_mode
    }),
    { set }
)(SettingsExtensionAdd)