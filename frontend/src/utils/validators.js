export const isAllLanguagesValid = (data) => {
        const allLangs = [data.language, ...(data.translations?.map(t => t.lang) || [])].filter(Boolean);

        return allLangs.every(lang => {
            if (lang === data.language) {
                return !!data.title && !!data.content;
            }
            const t = data.translations?.find(t => t.lang === lang);
            return !!t?.title && !!t?.content;
        });
    };

export const validGeneral = (data) => {
    const isPrivacyValid = data.privacy !== 'share'
    || (data.privacy === 'share' && Array.isArray(data.shareWith) && data.shareWith.length > 0);

    const isFriendlyUrl = !data.isFriendlyUrl || (data.isFriendlyUrl && data.slug);

    const isRestrictedValid = !data.restrictedAccess 
        || (data.restrictedAccess && (data.password || data.sendOtp));

    const isPromotedValid = !data.isPromoted 
        || !!data.promoteDuration || (data.isPromoted && data.promoteEnd);

    const status = isPrivacyValid && isRestrictedValid && isPromotedValid && isFriendlyUrl;
    return status;
}

export const isSaveDisabled = (type, data, curItemId) => {
    const allLangsValid = isAllLanguagesValid(data);

    if (type === 'story' && validGeneral(data) && data.title && data.content && data.text && allLangsValid) {
        return false;
    }
    if (type === 'card' && validGeneral(data) && data.title && data.cardDetails) {
        return false;
    }
    if (type === 'collection' && validGeneral(data) && data.title && data.items && data.items.length) {
        return false;
    }
    if (type === 'shareUrl' && validGeneral(data) && data.title && data.url && data.preview) {
        return false;
    }
    if (type === 'drawing' && validGeneral(data) && data.title && (curItemId || (!curItemId && data.base64))) {
        return false;
    }
    if (type === 'vote' && validGeneral(data) && data.title && data.voteType && data.deadline) {
        if (data.voteType === 'posts' && data.items && data.items.length) {
            return false;
        }
        if (data.voteType === 'users' && data.users && data.users.length) {
            return false;
        }
        if (data.voteType === 'custom' && data.customOptions && data.customOptions.length) {
            return false;
        }
    }
    return true;
}