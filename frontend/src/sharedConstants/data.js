
export const Fonts = ['Arial', 'Roboto', 'Vibur', 'Fredoka', 'Noto Sans', 'Modak', 'Kablammo', 'Mogra', 'Flavors', 'Damion', 'Borel', 'Bowlby One SC', 'Fugaz One', 'Caesar Dressing', 'Croissant One', 'Monoton', 'Changa One', 'Charmonman', 'Fascinate Inline', 'Squada One', 'Butcherman', 'Nosifer', 'Hanalei Fill'];
export const FontSizes = ['10px','12px', '14px', '16px', '18px', '20px', '25px', '30px', '35px', '40px', '50px', '60px', '80px', '100px'];
export const PRIVACY_DATA = [
    {
        label: 'Public',
        value: 'public'
    },
    {
        label: 'Shared',
        value: 'shared'
    },
    {
        label: 'Only Me',
        value: 'onlyMe'
    }
];
export const TEXT_SHADOWS = [
    {
        label: 'None',
        value: 'none'
    },
    {
        label: 'Emboss',
        value: '1px 1px 0 #ccc, 2px 2px 0 #aaa, 3px 3px 0 #888'
    },
    {
        label: 'Rainbow',
        value: 'rainbow'
    },
    {
        label: 'Dark',
        value: '.1em .1em 0 hsl(200 50% 30%)'
    },
    {
        label: 'Blur',
        value: '0 13.36px 8.896px #c4b59d,0 -2px 1px #fff'
    },
    {
        label: 'Cartoon',
        value: 'cartoon'
    },
    {
        label: 'Neon',
        value: '0 0 5px #0ff,0 0 10px #0ff,0 0 20px #0ff,0 0 40px #0ff,0 0 80px #0ff,0 0 90px #0ff,0 0 100px #0ff'
    }
]

export const medalUrl = (level) => {
        switch(level) {
            case 'Rising Talent':
            return '/levels/level1.webp';
            case 'Indie Dreamer':
            return '/levels/level2.webp';
            case 'Stage Virtuoso':
            return '/levels/level3.webp';
            case 'Master Performer':
            return '/levels/level4.webp';
            case 'Genre Bender':
            return '/levels/level5.webp';
            case 'Celestial Legend':
            return '/levels/level6.webp'
        }
    }

export const TOP_ENTRIES = [
  // Post-related
  { id: 'views', label: 'Top Views', unit: 'views', type: 'post' },
  { id: 'noOfComments', label: 'Top Comments', unit: 'comments', type: 'post' },
  { id: 'noOfLikes', label: 'Top Likes', unit: 'likes', type: 'post' },

  // Comment-related
  { id: 'noOfLikes', label: 'Top Liked Comments', unit: 'likes', type: 'comment' },

  // User-related
  { id: 'userPoints', label: 'Top Stars Users', unit: 'stars', type: 'user' },
  { id: 'noOfPosts', label: 'Top Posted Users', unit: 'posts', type: 'user' },
  { id: 'noOfComments', label: 'Top Commented Users', unit: 'comments', type: 'user' }
];

export const ITEM_TYPE = ['shareUrl', 'draco', 'card', 'story', 'collection', 'vote'];
export const SORT_BY = [
    {
        label: 'Latest',
        value: 'latest'
    },
    {
        label: 'Oldest',
        value: 'oldest'
    },
    {
        label: 'Most Viewed',
        value: 'mostViewed'
    },
    {
        label: 'Most Commented',
        value: 'mostCommented'
    }
]

export const WRITTEN_CATS = ['Diary / Journal', 'Essay', 'Short Story', 'Novel', 'Memoir', 'Poetry', 'Personal Letter', 'Confession / Personal Sharing', 'Will / Testament', 'Article', 'Question / Inquiry', 'Review / Critique', 'Speech', 'Research Paper', 'Fiction / Non-fiction', 'Others'];
export const DRAWING_CATS = ['Portrait', 'Landscape', 'Still Life', 'Abstract', 'Realism', 'Surrealism', 'Fantasy / Sci-fi', 'Cartoon / Comic Art', 'Concept Art', 'Calligraphy', 'Graffiti / Street Art', 'Expressionism', 'Minimalism', 'Cubism', 'Illustration', 'Typography Art'];
export const PROMOTION_DATA = [
    {
        label: '1 day',
        value: '1d',
        points: 100
    },
    {
        label: '3 days',
        value: '3d',
        points: 270
    },
    {
        label: '7 days',
        value: '7d',
        points: 560
    },
    {
        label: '30 days',
        value: '30d',
        points: 2100
    }
]

export const PointsMenu = ['Stars Guide', 'Send Stars'];
export const profileMenuItems = [
  { key: 'general', label: 'Profile Info' },
  { key: 'change-password', label: 'Change Password' },
  { key: 'support', label: 'Support Methods' },
  { key: 'hideblock', label: 'Blocked / Hidden' },
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'Users'}
];

export const VideoSpeeds = [
  { label: '1x', value: 'speed:1x'},
  { label: '0.25x', value: 'speed:0.25x' },
  { label: '0.5x', value: 'speed:0.5x' },
  { label: '1.5x', value: 'speed:1.5x' },
  { label: '2x', value: 'speed:2x' },
  { label: '3x', value: 'speed:3x' },
  { label: '5x', value: 'speed:5x' },
  { label: 'Progressive Speed', value: 'effect:accelerate' },
  { label: 'Decelerating Speed', value: 'effect:decelerate' },
  { label: 'Cinematic (Slow-Fast-Slow)', value: 'effect:slowFastSlow' },
  { label: 'Cinematic (Fast-Slow-Fast)', value: 'effect:fastSlowFast' }
];