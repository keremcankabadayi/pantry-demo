const adjectives = [
  'secret', 'hidden', 'safe', 'blue', 'green', 'red', 'gold', 'silver',
  'bright', 'quiet', 'fast', 'calm', 'happy', 'smart', 'strong',
  'brave', 'wise', 'wild', 'soft', 'dark'
];

const nouns = [
  'bird', 'fish', 'cat', 'dog', 'lion', 'tiger', 'eagle', 'hawk',
  'star', 'sun', 'moon', 'sea', 'mountain', 'forest', 'river',
  'tree', 'cloud', 'wind', 'rain', 'snow'
];

const verbs = [
  'runs', 'flies', 'swims', 'shines', 'smiles', 'dances', 'sings',
  'jumps', 'thinks', 'speaks', 'listens', 'watches', 'waits', 'stands', 'flows',
  'moves', 'sleeps', 'dreams', 'plays', 'walks'
];

export const generateSecretKey = () => {
  const getRandomWord = (array) => array[Math.floor(Math.random() * array.length)];
  
  return [
    getRandomWord(adjectives),
    getRandomWord(nouns),
    getRandomWord(verbs)
  ].join('-');
}; 