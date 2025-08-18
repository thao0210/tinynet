import { uploadFileToR2, convertToFile } from '@/utils/file';
import { max } from 'date-fns';

export const itemStrategies = async (type, data, user, imageUrl, updatedContent, usePoint) => {
    const general = {
        privacy: data?.privacy || 'public',
        shareWith: data.shareWith ? data.shareWith.map(item => item.username) : null,
        type: data?.type,
        allowComments: data?.allowComments,
        restrictedAccess: data?.restrictedAccess || false,
        password: data?.password || '',
        passwordHint: data?.passwordHint || '',
        sendOtp: data?.sendOtp,
        title: data?.title || '',
        backgroundMusic: data?.backgroundMusic || '',
        showTitle: data?.showTitle,
        isAnonymous: data?.isAnonymous || false,
        isFriendlyUrl: data?.isFriendlyUrl || null,
        slug: data?.slug || null,
        usePoint: usePoint || null,
        isPromoted: data?.isPromoted || false,
        promoteDuration: data?.promoteDuration || null
    }

    const convertToR2Url = async (json, type) => {
        const file = convertToFile(json, `savedPath_${Date.now()}.json`);
        const {url} = await uploadFileToR2(file, `dracos/savedPath_${Date.now()}.json`);
        if (url) return url;
        return '';
    }

    switch(type) {
        case "story": 
            return {
                ...general,
                content: updatedContent || data?.content || '',
                text: data?.text || '',
                themeType: data?.themeType,
                theme: data?.theme,
                themeShape: data?.themeShape || null,
                storyCategory: data?.storyCategory,
                voice: data?.voice || false,
                language: data?.language || 'en-US',
                translations: data?.translations,
                backgroundMusic: data?.backgroundMusic || '',
                allowContribution: data?.allowContribution || false
            }
        case "draco":
            const dracoPathsUrl = (data?.canEdit && data?.savedPaths)
              ? await convertToR2Url(data.savedPaths, type)
              : '';
            return {
                ...general,
                savedPaths: dracoPathsUrl || null, // JSON của Fabric.js
                dracoCategory: data?.dracoCategory || 'Portrait',
                imageUrl: imageUrl,
                canEdit: data?.canEdit,
                hasBg: data?.hasBg
            }
        case "card":
            return {
                ...general,
                cardDetails: data?.cardDetails || null,
                thumbnailImage: data?.thumbnailImage || null,
                cardTextContent: data?.cardTextContent || null,
                searchContent: data?.searchContent
            }
        case "collection":
            return {
                ...general,
                items: data?.items || null,
                showOnlyInCollection: data?.showOnlyInCollection || false
            }
        case "shareUrl": 
            return {
                ...general,
                url: data?.url || '',
                preview: data?.preview || '',
            }
        case "vote": 
            return {
                ...general,
                description: data?.description || '', 
                deadline: data?.deadline || '',
                timezone: user.timezone,
                voteType: data?.voteType || '',
                voteMode: data?.voteMode || '',
                voteReward: data?.voteReward || 0,
                maxVoters: Number(data?.voteReward) > 0 ? Math.floor(user.userPoints / Number(data.voteReward)) : 0,
                items: data?.items || null,
                users: data?.users || null,
                customOptions: data?.customOptions || null
            }
    }
}