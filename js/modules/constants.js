export const SAVE_KEY = 'mutant_musician_lab_save_v1';
export const DATA_FILES = ['creationOptions','genres','roles','vices','traits','mutations','items','gigs','events','names','audioMap','uiText'];
export const STAGE_CONFIG = [
  { id:'embryo', hours:0, label:'Tube Embryo' },
  { id:'infant', hours:6, label:'Infant' },
  { id:'child', hours:24, label:'Child' },
  { id:'teen', hours:48, label:'Teen Disaster' },
  { id:'adult', hours:72, label:'Adult' }
];
export const NEED_KEYS = ['food','water','rest','mood','inspiration','vice','cleanliness','health'];
export const BASE_STAT_KEYS = ['talent','technique','originality','discipline','ego','charisma','weirdness','resilience'];
export const CARE_ACTIONS = {
  feed:{ food:24, mood:4, health:1, cleanliness:-2, cash:-2 },
  water:{ water:28, mood:2, cash:-1 },
  rest:{ rest:32, health:4, mood:2, inspiration:-1 },
  clean:{ cleanliness:34, mood:-1, health:2, cash:-1 },
  vice:{ vice:28, mood:8, health:-4, inspiration:4, cash:-3 },
  practiceAction:{ inspiration:12, rest:-8, water:-4, food:-4, mood:3, xp:6, stress:4 }
};
export const DEFAULT_SETTINGS = { audioEnabled:true, fastTickSeconds:20 };
export const DEFAULT_STATE = {
  playerProfile:{ cash:120, labLevel:1, selectedMusicianId:null, starterChosen:false },
  clockState:{ lastSavedAt:Date.now(), currentTime:Date.now(), freezeTime:false, speedMultiplier:1 },
  musicians:[],
  dnaArchive:[],
  inventory:[
    { id:'venue_nachos', qty:2 },
    { id:'electrolyte_goo', qty:2 },
    { id:'solvent_wipes', qty:2 },
    { id:'cheap_thrill', qty:1 },
    { id:'revival_kit', qty:1 }
  ],
  labUpgrades:{ better_tube_filter:false, lab_assistant_drone:false, advanced_splice_license:false, snapshotUnlocked:false },
  gigBoard:[],
  activeGigs:[],
  notifications:[],
  settings:{ audioEnabled:true, fastTickSeconds:20 }
};
