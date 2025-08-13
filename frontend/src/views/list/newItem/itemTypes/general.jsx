import RadioList from '@/components/radio';
import Checkbox from '@/components/checkbox';
import { useEffect } from 'react';
import classes from '../styles.module.scss';
import SearchUsers from '@/components/searchUsers';
import Dropdown from '@/components/dropdown';
import { voiceLanguages } from '@/utils/lang';
import { useStore } from '@/store/useStore';
import { DRAWING_CATS, PRIVACY_DATA, WRITTEN_CATS, PROMOTION_DATA } from '@/sharedConstants/data';
import {Slug, Vote} from './generalComponents';
import Tooltip from '@/components/Utilities';
import { format } from "date-fns";

const GeneralInfos = ({data, setData, type, curItemId, usePoint, setUsePoint, languages}) => {
    const langs = voiceLanguages();
    const {user} = useStore();
    // const langsNames = langs.map(item => item.name);
    const onPasswordChange = (e) => {
        setData({...data, password: e.target.value});
    }

    const onPasswordHintChange = (e) => {
        setData({...data, passwordHint: e.target.value});
    }

    const onStoryCatSelect = (value) => {
        setData({...data, storyCategory: value});
    }

    const onDrawingCatSelect = (value) => {
        setData({...data, drawingCategory: value});
    }

    useEffect(()=>{
        if (!data.restrictedAccess && (data.password || data.sendOtp)) {
            setData({...data, password: '', sendOtp: false});
        }
    }, [data.restrictedAccess]);

    useEffect(()=>{
        if(!data.isPromoted) {
            const promoteItem = PROMOTION_DATA.filter(item => item.value === data.promoteDuration);
            if (promoteItem?.length > 0 && promoteItem[0].points) {
                console.log('pomote item', promoteItem[0].points);
                setData({...data, promoteDuration: ''});
                setUsePoint(prev => prev - promoteItem[0].points);
            }
        }
    }, [data.isPromoted]);

    useEffect(() => {
        if (!data.isFriendlyUrl && data.slug) {
            setData(prev => ({...prev, slug: ''}));
        }
    }, [data.isFriendlyUrl]);

    return (
        <div className={classes.basicInfo} id='basicInfo'>
        <div>
            <label>Privacy</label>
            <RadioList 
                list={PRIVACY_DATA}
                value={data.privacy || 'public'}
                setValue={setData}
                data={data}
                datafield='privacy'
            />
            {
                data.privacy === 'share' &&
                <div>
                    <label>Share with (users)</label>
                    <SearchUsers users={data.shareWith || []} setUsers={setData} datafield='shareWith' />
                </div>
            }
        </div>
        {
            type === 'story' &&
            <div>
                <label>Categories</label>
                <Dropdown
                    curValue={data.storyCategory || 'Diary / Journal'}
                    list={WRITTEN_CATS}
                    onSelect={onStoryCatSelect}
                    width={150}
                    dropdownContainerSelector='#basicInfo'
                />
            </div>
        }
        {
            type === 'drawing' &&
            <div>
                <label>Art Styles</label>
                <Dropdown
                    curValue={data.drawingCategory || 'Portrait'}
                    list={DRAWING_CATS}
                    onSelect={onDrawingCatSelect}
                    label={'Art Styles'}
                    width={150}
                    showTitleAsLabel={true}
                    dropdownContainerSelector='#basicInfo'
                />
            </div>
        }
        <div>
            <Checkbox
                label={'Show title'} 
                isChecked={data.showTitle}
                data={data}
                dataFieldName='showTitle'
                setIsChecked={setData} 
            />
        </div>
        <div>
            <Checkbox
                label={'Hide my identity'} 
                isChecked={data.isAnonymous}
                data={data}
                dataFieldName='isAnonymous'
                setIsChecked={setData} 
            />
        </div>
        {
            type === 'drawing' && !curItemId &&
            <div>
                <Checkbox
                    label={`Save ${type} paths to edit`} 
                    isChecked={data.canEdit || false}
                    data={data}
                    dataFieldName='canEdit'
                    setIsChecked={setData}
                    points={200}
                    usePoint={usePoint}
                    setUsePoint={setUsePoint}
                />
            </div>
        }
        {
            type === 'collection' &&
            <div>
            <Checkbox
                label={'Show Only in Collection'} 
                isChecked={data.showOnlyInCollection || false}
                data={data}
                dataFieldName='showOnlyInCollection'
                setIsChecked={setData} 
            />
            </div>
        }
        <div>
            <Checkbox
                label={'Allow Comments'} 
                isChecked={data.allowComments} 
                setIsChecked={setData}
                data={data}
                dataFieldName='allowComments'
            />
        </div>
        <div>
            <Checkbox
                label={'Use custom URL'} 
                isChecked={data.isFriendlyUrl}
                data={data}
                dataFieldName='isFriendlyUrl'
                setIsChecked={setData}
            />
            {
                data.isFriendlyUrl &&
                <Slug data={data} setData={setData} originalSlug={data?.slug || ''} />
            }
        </div>
        
        <div>
            <Checkbox
                label='Limit viewers'
                isChecked={data.restrictedAccess || false} 
                setIsChecked={setData} 
                data={data}
                dataFieldName='restrictedAccess'
                points={50}
                usePoint={usePoint}
                setUsePoint={setUsePoint}
                isEdit={curItemId && data.restrictedAccess}
            />
        </div>
        {
            data.restrictedAccess &&
            <div className={classes.access}>
                <div>
                    <label>Post password <Tooltip content='Only users with the password can view this post.' /></label>
                    <input type='text' className={classes.password} placeholder='Set a password' value={data && data.password} onChange={onPasswordChange} />
                </div>
                <div>
                    <label>Add a hint <Tooltip content='Users can try to guess the password by hint' /></label>
                    <textarea placeholder='Hint content' value={data && data.passwordHint} onChange={onPasswordHintChange} />
                </div>
                <div>
                    <Checkbox
                        label={'Send OTP to viewer\'s email'} 
                        isChecked={data.sendOtp || false} 
                        setIsChecked={setData}
                        data={data}
                        dataFieldName='sendOtp' 
                    />
                </div>
            </div>
        }
        {
            type === 'story' &&
            <Checkbox
                label={'Allow other users to contribute to your story'} 
                isChecked={data.allowContribution}
                data={data}
                dataFieldName='allowContribution'
                setIsChecked={setData}
            />
        }
        {
            type === 'vote' &&
            <Vote data={data} setData={setData} user={user} />
        }
        <div>
            {
                data?._id &&
                <Checkbox
                    label='Promote this post'
                    isChecked={data.isPromoted || false} 
                    setIsChecked={setData}
                    data={data}
                    dataFieldName='isPromoted'
                    tippy='Promoting a post will place it above normal posts during the promotion period. Newer posts without promotion will still appear below this one.'
                />
            }
            {
                data.isPromoted &&
                <div className={classes.access}>
                    {
                        data.promoteEnd &&
                        <div>
                            <label>Promotion end time:</label>
                            <strong>{format(data.promoteEnd, 'dd-MM-yyyy HH:mm:ss')}</strong>
                        </div>
                    }
                    
                    <RadioList 
                        list={PROMOTION_DATA}
                        value={data.promoteDuration}
                        setValue={setData}
                        data={data}
                        datafield='promoteDuration'
                        isVertical
                        setUsePoint={setUsePoint}
                        labelWidth={145}
                    />
                </div>
            }
        </div>
    </div>
    )
}

export default GeneralInfos;