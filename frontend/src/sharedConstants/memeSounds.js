const baseUrl = import.meta.env.VITE_R2_BASE_URL;

const MEME_SOUNDS =
[
  {
    label: "Among Us Trap Remix Bass",
    value: `${baseUrl}/memes/among_us_trap_remix_bass.mp3`
  },
  {
    label: "Anime Wow Sound Effect Mp3cut",
    value: `${baseUrl}/memes/anime-wow-sound-effect-mp3cut.mp3`
  },
  {
    label: "Ashley Look At Me",
    value: `${baseUrl}/memes/ashley-look-at-me.mp3`
  },
  {
    label: "Baby Laughing Meme",
    value: `${baseUrl}/memes/baby-laughing-meme.mp3`
  },
  {
    label: "Bad To The Bone Meme",
    value: `${baseUrl}/memes/bad-to-the-bone-meme.mp3`
  },
  {
    label: "Can We Get Much Higher One Piece",
    value: `${baseUrl}/memes/can-we-get-much-higher-one-piece.mp3`
  },
  {
    label: "Cat Vibing To Ievan Polkka",
    value: `${baseUrl}/memes/cat-vibing-to-ievan-polkka.mp3`
  },
  {
    label: "Ching Cheng Hanji",
    value: `${baseUrl}/memes/ching-cheng-hanji.mp3`
  },
  {
    label: "Dababy Lets Go",
    value: `${baseUrl}/memes/dababy-lets-go.mp3`
  },
  {
    label: "Danger Alarm",
    value: `${baseUrl}/memes/danger-alarm.mp3`
  },
  {
    label: "Deja Vu Fade",
    value: `${baseUrl}/memes/deja-vu-fade.mp3`
  },
  {
    label: "Dj Airhorn Sound",
    value: `${baseUrl}/memes/dj-airhorn-sound.mp3`
  },
  {
    label: "Dramatic Music Tiktok",
    value: `${baseUrl}/memes/dramatic-music-tiktok.mp3`
  },
  {
    label: "Duck Toy Sound",
    value: `${baseUrl}/memes/duck-toy-sound.mp3`
  },
  {
    label: "Dun Dun Dun Sound Effect Brass 8nFBccR",
    value: `${baseUrl}/memes/dun-dun-dun-sound-effect-brass_8nFBccR.mp3`
  },
  {
    label: "Emotional Damage",
    value: `${baseUrl}/memes/emotional-damage.mp3`
  },
  {
    label: "Fail Sound Effect",
    value: `${baseUrl}/memes/fail-sound-effect.mp3`
  },
  {
    label: "Fbi Open Up",
    value: `${baseUrl}/memes/fbi-open-up.mp3`
  },
  {
    label: "Fortunate Son Mp3cut",
    value: `${baseUrl}/memes/fortunate_son-mp3cut.mp3`
  },
  {
    label: "Gas Gas Gaslq",
    value: `${baseUrl}/memes/gas-gas-gaslq.mp3`
  },
  {
    label: "Gas Gas Gaslqshort",
    value: `${baseUrl}/memes/gas-gas-gaslqshort.mp3`
  },
  {
    label: "Gogogogogogo",
    value: `${baseUrl}/memes/gogogogogogo.mp3`
  },
  {
    label: "Goofy Ahh Sounds",
    value: `${baseUrl}/memes/goofy-ahh-sounds.mp3`
  },
  {
    label: "Haha",
    value: `${baseUrl}/memes/haha.mp3`
  },
  {
    label: "Happy Birthday 1",
    value: `${baseUrl}/memes/happy-birthday-1.mp3`
  },
  {
    label: "Happy Birthday Group",
    value: `${baseUrl}/memes/happy-birthday-group.mp3`
  },
  {
    label: "Happy Birthday Midi",
    value: `${baseUrl}/memes/happy-birthday-midi.mp3`
  },
  {
    label: "Happy Birthday Song",
    value: `${baseUrl}/memes/happy-birthday-song.mp3`
  },
  {
    label: "Happy Birthday",
    value: `${baseUrl}/memes/happy_birthday.mp3`
  },
  {
    label: "Hq Coffin Dance Funeral Vicetone Tony Igy Astronomia",
    value: `${baseUrl}/memes/hq-coffin-dance-funeral-vicetone-tony-igy-astronomia.mp3`
  },
  {
    label: "Huh",
    value: `${baseUrl}/memes/huh.mp3`
  },
  {
    label: "I Was The Knight In Shining Armor In Your Movie",
    value: `${baseUrl}/memes/i-was-the-knight-in-shining-armor-in-your-movie.mp3`
  },
  {
    label: "Jojos Golden Wind",
    value: `${baseUrl}/memes/jojos-golden-wind.mp3`
  },
  {
    label: "Joker Shitpost Beatbox",
    value: `${baseUrl}/memes/joker-shitpost-beatbox.mp3`
  },
  {
    label: "Laughing Dog Meme",
    value: `${baseUrl}/memes/laughing-dog-meme.mp3`
  },
  {
    label: "Let Her Go",
    value: `${baseUrl}/memes/let-her-go.mp3`
  },
  {
    label: "Man Beatboxing",
    value: `${baseUrl}/memes/man-beatboxing.mp3`
  },
  {
    label: "Man Screaming Memes Sound Effect",
    value: `${baseUrl}/memes/man-screaming-memes-sound-effect.mp3`
  },
  {
    label: "Meme De Creditos Finales",
    value: `${baseUrl}/memes/meme-de-creditos-finales.mp3`
  },
  {
    label: "Meme Sadviolon",
    value: `${baseUrl}/memes/meme-sadviolon.mp3`
  },
  {
    label: "Metal Gear Alert Sound Effect XKoHReZ",
    value: `${baseUrl}/memes/metal-gear-alert-sound-effect_XKoHReZ.mp3`
  },
  {
    label: "Metal Pipe Falling",
    value: `${baseUrl}/memes/metal-pipe-falling.mp3`
  },
  {
    label: "Mission Failed Well Get Em Next Time Sound Effect Zxhixnbk",
    value: `${baseUrl}/memes/mission-failed-well-get-em-next-time-sound-effect-zxhixnbk.mp3`
  },
  {
    label: "No No Wait Wait",
    value: `${baseUrl}/memes/no-no-wait-wait.mp3`
  },
  {
    label: "Oh No No No Laugh",
    value: `${baseUrl}/memes/oh-no-no-no-laugh.mp3`
  },
  {
    label: "Oh No No No Tik Tok Song",
    value: `${baseUrl}/memes/oh-no-no-no-tik-tok-song.mp3`
  },
  {
    label: "Punch Gaming",
    value: `${baseUrl}/memes/punch-gaming.mp3`
  },
  {
    label: "Quack",
    value: `${baseUrl}/memes/quack.mp3`
  },
  {
    label: "Run Vine Sound Effect",
    value: `${baseUrl}/memes/run-vine-sound-effect.mp3`
  },
  {
    label: "Saddest Song Airhorn",
    value: `${baseUrl}/memes/saddest-song-airhorn.mp3`
  },
  {
    label: "Snoop Dogs Meme",
    value: `${baseUrl}/memes/snoop-dogs-meme.mp3`
  },
  {
    label: "Spiderman Meme",
    value: `${baseUrl}/memes/spiderman-meme.mp3`
  },
  {
    label: "Spongebob Squarepants The Yellow Album 21 Electric Zoo Audiotrimmer",
    value: `${baseUrl}/memes/spongebob-squarepants-the-yellow-album-21-electric-zoo-audiotrimmer.mp3`
  },
  {
    label: "Taco Bell Bong Sfx",
    value: `${baseUrl}/memes/taco-bell-bong-sfx.mp3`
  },
  {
    label: "The Lion Sleeps Tonight",
    value: `${baseUrl}/memes/the-lion-sleeps-tonight.mp3`
  },
  {
    label: "Tmpq7mpzzl9",
    value: `${baseUrl}/memes/tmpq7mpzzl9.mp3`
  },
  {
    label: "Trollolo",
    value: `${baseUrl}/memes/trollolo.mp3`
  },
  {
    label: "U Got That Mp3 Fix",
    value: `${baseUrl}/memes/u-got-that-mp3-fix.mp3`
  },
  {
    label: "Vine Boom",
    value: `${baseUrl}/memes/vine-boom.mp3`
  },
  {
    label: "Window Xp Shutdown",
    value: `${baseUrl}/memes/window-xp-shutdown.mp3`
  },
  {
    label: "Windows Xp Errors Song",
    value: `${baseUrl}/memes/windows-xp-errors-song.mp3`
  },
  {
    label: "Windows Xp Startup",
    value: `${baseUrl}/memes/windows-xp-startup.mp3`
  },
  {
    label: "Women Haha",
    value: `${baseUrl}/memes/women-haha.mp3`
  },
  {
    label: "Wrong Answer Buzzer",
    value: `${baseUrl}/memes/wrong-answer-buzzer.mp3`
  },
  {
    label: "X Files Theme",
    value: `${baseUrl}/memes/x-files-theme.mp3`
  },
  {
    label: "You Are My Sunshine",
    value: `${baseUrl}/memes/you-are-my-sunshine.mp3`
  },
  {
    label: "You Know The Rules And So Do I Say Goodbye",
    value: `${baseUrl}/memes/you-know-the-rules-and-so-do-i-say-goodbye.mp3`
  }
]

export default MEME_SOUNDS;