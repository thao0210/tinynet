// ViewItem/ItemThemes.jsx
import RainEffect, {RandomShapesBackground, AnimatedBackground } from '@/components/themes';
import { themeBg } from '@/utils/color';

const themeToType = {
    theme12: 'cloud',
    theme13: 'river',
    theme14: 'field',
    theme15: 'music',
    theme16: 'balloon'
};

const ItemThemes = ({ item }) => {
    if (!item?.theme) return null;

    const selectedType = themeToType[item.theme];

    if (['theme8', 'theme9', 'theme10', 'theme11'].includes(item.theme)) {
        return <RainEffect {...themeBg(item.theme)} />;
    }

    if (['theme12', 'theme13', 'theme14', 'theme15', 'theme16'].includes(item.theme)) {
        return <AnimatedBackground type={selectedType} />;
    }

    if (item.themeType === 'shapes' && item.themeShape) {
        return <RandomShapesBackground themeShape={item.themeShape} />;
    }

    return null;
};

export default ItemThemes;
