import {
  EmojiPicker,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListComponents,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
} from "frimousse";
import { ChevronLeft, Search } from "lucide-react";
import { type ChangeEvent, memo, useState } from "react";

import { cn } from "@/shared/lib/utils";

const EMOJI_SKELETON_CELLS = Array.from(
  { length: 54 },
  (_, index) => `emoji-skeleton-${index}`,
);

const COMPACT_REACTION_COLUMNS = 9;

interface ReactionEmoji {
  emoji: string;
  label: string;
  tags: readonly string[];
}

interface ReactionEmojiGroup {
  emojis: readonly ReactionEmoji[];
  title: string;
}

const SUGGESTED_REACTION_EMOJIS = [
  reactionEmoji("👍", "Thumbs up", ["yes", "agree", "ok", "approve"]),
  reactionEmoji("❤️", "Red heart", ["love", "care", "warm"]),
  reactionEmoji("😂", "Face with tears of joy", ["laugh", "funny"]),
  reactionEmoji("🔥", "Fire", ["hot", "great", "strong"]),
  reactionEmoji("🎉", "Party popper", ["celebrate", "congrats"]),
  reactionEmoji("👏", "Clapping hands", ["applause", "nice"]),
  reactionEmoji("✨", "Sparkles", ["magic", "nice", "clean"]),
  reactionEmoji("🤝", "Handshake", ["deal", "support", "agree"]),
  reactionEmoji("😍", "Heart eyes", ["love", "excited"]),
  reactionEmoji("😊", "Smiling face", ["happy", "kind"]),
  reactionEmoji("🙏", "Folded hands", ["please", "thanks"]),
  reactionEmoji("🙌", "Raised hands", ["yay", "celebrate"]),
  reactionEmoji("👀", "Eyes", ["watching", "looking"]),
  reactionEmoji("💯", "Hundred points", ["perfect", "true"]),
  reactionEmoji("🚀", "Rocket", ["launch", "fast", "go"]),
  reactionEmoji("😅", "Grinning sweat", ["relief", "nervous laugh"]),
  reactionEmoji("🤔", "Thinking face", ["think", "curious"]),
  reactionEmoji("😎", "Sunglasses face", ["cool", "confident"]),
  reactionEmoji("🥳", "Partying face", ["party", "celebrate"]),
  reactionEmoji("😭", "Loudly crying face", ["cry", "emotional"]),
  reactionEmoji("🥹", "Holding back tears", ["touched", "sweet"]),
  reactionEmoji("😮", "Surprised face", ["wow", "shock"]),
  reactionEmoji("😢", "Crying face", ["sad", "sorry"]),
  reactionEmoji("😡", "Angry face", ["mad", "frustrated"]),
  reactionEmoji("🤯", "Exploding head", ["mind blown", "wow"]),
  reactionEmoji("💪", "Flexed biceps", ["strong", "power"]),
  reactionEmoji("👌", "OK hand", ["ok", "perfect"]),
  reactionEmoji("🫶", "Heart hands", ["care", "support"]),
  reactionEmoji("🤗", "Hugging face", ["hug", "support"]),
  reactionEmoji("😬", "Grimacing face", ["awkward", "tense"]),
  reactionEmoji("🙃", "Upside-down face", ["silly", "awkward"]),
  reactionEmoji("😴", "Sleeping face", ["tired", "sleep"]),
  reactionEmoji("🤩", "Star-struck", ["excited", "amazed"]),
  reactionEmoji("😌", "Relieved face", ["calm", "good"]),
  reactionEmoji("😤", "Face with steam", ["determined", "annoyed"]),
  reactionEmoji("😱", "Screaming face", ["scared", "shock"]),
  reactionEmoji("✅", "Check mark", ["done", "yes", "complete"]),
  reactionEmoji("❌", "Cross mark", ["no", "wrong", "cancel"]),
  reactionEmoji("⚠️", "Warning", ["careful", "alert"]),
  reactionEmoji("💔", "Broken heart", ["sad", "hurt"]),
  reactionEmoji("💜", "Purple heart", ["love", "care"]),
  reactionEmoji("🥰", "Smiling face with hearts", ["love", "sweet"]),
  reactionEmoji("🫠", "Melting face", ["awkward", "overwhelmed"]),
  reactionEmoji("🙄", "Rolling eyes", ["annoyed", "sarcastic"]),
  reactionEmoji("😏", "Smirking face", ["smirk", "playful"]),
  reactionEmoji("😜", "Winking tongue", ["silly", "joke"]),
  reactionEmoji("🤪", "Zany face", ["silly", "wild"]),
  reactionEmoji("😋", "Yum face", ["food", "nice"]),
  reactionEmoji("🥱", "Yawning face", ["tired", "sleepy"]),
  reactionEmoji("😇", "Halo face", ["kind", "good"]),
  reactionEmoji("😈", "Smiling face with horns", ["mischief", "playful"]),
  reactionEmoji("👋", "Waving hand", ["hello", "bye"]),
  reactionEmoji("✌️", "Victory hand", ["peace", "two"]),
  reactionEmoji("🫡", "Saluting face", ["respect", "done"]),
  reactionEmoji("🤣", "Rolling laughing face", ["laugh", "funny", "lol"]),
  reactionEmoji("😄", "Smiling eyes", ["happy", "smile"]),
  reactionEmoji("😆", "Laughing face", ["laugh", "funny"]),
  reactionEmoji("😳", "Flushed face", ["embarrassed", "wow"]),
  reactionEmoji("😶", "Face without mouth", ["silent", "speechless"]),
  reactionEmoji("😐", "Neutral face", ["neutral", "ok"]),
  reactionEmoji("😑", "Expressionless face", ["blank", "done"]),
  reactionEmoji("😒", "Unamused face", ["annoyed", "bored"]),
  reactionEmoji("🤭", "Hand over mouth", ["oops", "laugh"]),
  reactionEmoji("🫢", "Eyes open hand over mouth", ["oops", "shock"]),
  reactionEmoji("🫣", "Peeking face", ["shy", "watching"]),
  reactionEmoji("😵", "Dizzy face", ["stunned", "overwhelmed"]),
  reactionEmoji("😵‍💫", "Spiral eyes face", ["dizzy", "confused"]),
  reactionEmoji("😞", "Disappointed face", ["sad", "sorry"]),
  reactionEmoji("😔", "Pensive face", ["sad", "thinking"]),
  reactionEmoji("😕", "Confused face", ["confused", "unsure"]),
  reactionEmoji("🙂", "Slight smile", ["smile", "ok"]),
  reactionEmoji("😀", "Grinning face", ["happy", "smile"]),
  reactionEmoji("😃", "Big smile", ["happy", "smile"]),
  reactionEmoji("😛", "Tongue face", ["silly", "playful"]),
  reactionEmoji("😝", "Squinting tongue", ["silly", "joke"]),
  reactionEmoji("🤤", "Drooling face", ["want", "food"]),
  reactionEmoji("😮‍💨", "Exhaling face", ["relief", "tired"]),
  reactionEmoji("🤌", "Pinched fingers", ["chef kiss", "perfect"]),
  reactionEmoji("🤞", "Crossed fingers", ["hope", "luck"]),
  reactionEmoji("👊", "Oncoming fist", ["bump", "power"]),
  reactionEmoji("✊", "Raised fist", ["power", "solidarity"]),
  reactionEmoji("🤘", "Rock hand", ["rock", "music"]),
  reactionEmoji("🫰", "Finger heart", ["love", "care"]),
  reactionEmoji("🫂", "People hugging", ["hug", "support"]),
  reactionEmoji("💥", "Collision", ["boom", "impact"]),
  reactionEmoji("⭐", "Star", ["star", "favorite"]),
  reactionEmoji("🌟", "Glowing star", ["star", "shine"]),
  reactionEmoji("⚡", "Lightning", ["fast", "energy"]),
  reactionEmoji("🌈", "Rainbow", ["color", "nice"]),
  reactionEmoji("☀️", "Sun", ["sun", "bright"]),
  reactionEmoji("🍕", "Pizza", ["food", "slice"]),
  reactionEmoji("☕", "Coffee", ["drink", "cafe"]),
  reactionEmoji("🎮", "Video game", ["game", "play"]),
  reactionEmoji("🎧", "Headphones", ["music", "listen"]),
  reactionEmoji("📚", "Books", ["study", "read"]),
  reactionEmoji("💡", "Light bulb", ["idea", "smart"]),
  reactionEmoji("📍", "Map pin", ["location", "place"]),
  reactionEmoji("🏆", "Trophy", ["win", "award"]),
  reactionEmoji("🥇", "Gold medal", ["win", "first"]),
  reactionEmoji("🎯", "Bullseye", ["target", "exact"]),
  reactionEmoji("🔔", "Bell", ["notify", "reminder"]),
  reactionEmoji("📝", "Memo", ["note", "write"]),
  reactionEmoji("💬", "Speech bubble", ["chat", "message"]),
] as const;

const COMPACT_REACTION_GROUPS = [
  {
    title: "Smileys & emotion",
    emojis: [
      reactionEmoji("😀", "Grinning face", ["happy", "smile"]),
      reactionEmoji("😃", "Big smile", ["happy", "smile"]),
      reactionEmoji("😄", "Smiling eyes", ["happy", "smile"]),
      reactionEmoji("😁", "Beaming face", ["happy", "smile"]),
      reactionEmoji("😆", "Laughing face", ["laugh", "funny"]),
      reactionEmoji("😇", "Halo face", ["kind", "good"]),
      reactionEmoji("😉", "Winking face", ["wink", "playful"]),
      reactionEmoji("😋", "Yum face", ["food", "nice"]),
      reactionEmoji("😛", "Tongue face", ["silly", "playful"]),
      reactionEmoji("😜", "Winking tongue", ["silly", "joke"]),
      reactionEmoji("🤪", "Zany face", ["silly", "wild"]),
      reactionEmoji("😝", "Squinting tongue", ["silly", "joke"]),
      reactionEmoji("🫠", "Melting face", ["awkward", "overwhelmed"]),
      reactionEmoji("🤭", "Hand over mouth", ["oops", "laugh"]),
      reactionEmoji("🫡", "Saluting face", ["respect", "done"]),
      reactionEmoji("🤫", "Shushing face", ["quiet", "secret"]),
      reactionEmoji("😐", "Neutral face", ["neutral", "ok"]),
      reactionEmoji("😑", "Expressionless face", ["blank", "done"]),
      reactionEmoji("😶", "Face without mouth", ["silent", "speechless"]),
      reactionEmoji("🫥", "Dotted line face", ["invisible", "awkward"]),
      reactionEmoji("😏", "Smirking face", ["smirk", "playful"]),
      reactionEmoji("😒", "Unamused face", ["annoyed", "bored"]),
      reactionEmoji("🙄", "Rolling eyes", ["annoyed", "sarcastic"]),
      reactionEmoji("😳", "Flushed face", ["embarrassed", "wow"]),
      reactionEmoji("🥺", "Pleading face", ["please", "soft"]),
      reactionEmoji("🥲", "Smiling tear", ["touched", "sad happy"]),
      reactionEmoji("🥹", "Holding back tears", ["touched", "sweet"]),
      reactionEmoji("😭", "Loudly crying face", ["cry", "emotional"]),
      reactionEmoji("😢", "Crying face", ["sad", "sorry"]),
      reactionEmoji("😞", "Disappointed face", ["sad", "sorry"]),
      reactionEmoji("😔", "Pensive face", ["sad", "thinking"]),
      reactionEmoji("😟", "Worried face", ["worry", "concern"]),
      reactionEmoji("😕", "Confused face", ["confused", "unsure"]),
      reactionEmoji("🙁", "Slight frown", ["sad", "frown"]),
      reactionEmoji("☹️", "Frowning face", ["sad", "frown"]),
      reactionEmoji("😣", "Persevering face", ["struggle", "effort"]),
      reactionEmoji("😖", "Confounded face", ["frustrated", "confused"]),
      reactionEmoji("😫", "Tired face", ["tired", "exhausted"]),
      reactionEmoji("😩", "Weary face", ["tired", "please"]),
      reactionEmoji("🥱", "Yawning face", ["tired", "sleepy"]),
      reactionEmoji("😴", "Sleeping face", ["tired", "sleep"]),
      reactionEmoji("🤤", "Drooling face", ["want", "food"]),
      reactionEmoji("🥶", "Cold face", ["cold", "freeze"]),
      reactionEmoji("🥵", "Hot face", ["hot", "intense"]),
      reactionEmoji("🤢", "Nauseated face", ["sick", "gross"]),
      reactionEmoji("🤮", "Vomiting face", ["sick", "gross"]),
      reactionEmoji("🤧", "Sneezing face", ["sick", "cold"]),
      reactionEmoji("😷", "Medical mask face", ["sick", "mask"]),
      reactionEmoji("🤒", "Thermometer face", ["sick", "fever"]),
      reactionEmoji("🤕", "Bandaged face", ["hurt", "injured"]),
      reactionEmoji("🤑", "Money face", ["money", "rich"]),
      reactionEmoji("🤠", "Cowboy face", ["fun", "hat"]),
      reactionEmoji("🥸", "Disguised face", ["secret", "glasses"]),
      reactionEmoji("🤓", "Nerd face", ["smart", "study"]),
      reactionEmoji("🧐", "Monocle face", ["inspect", "curious"]),
      reactionEmoji("😎", "Sunglasses face", ["cool", "confident"]),
      reactionEmoji("🥳", "Partying face", ["party", "celebrate"]),
      reactionEmoji("🤯", "Exploding head", ["mind blown", "wow"]),
    ],
  },
  {
    title: "People & body",
    emojis: [
      reactionEmoji("👍", "Thumbs up", ["yes", "agree", "ok", "approve"]),
      reactionEmoji("👎", "Thumbs down", ["no", "disagree"]),
      reactionEmoji("👏", "Clapping hands", ["applause", "nice"]),
      reactionEmoji("🙌", "Raised hands", ["yay", "celebrate"]),
      reactionEmoji("🙏", "Folded hands", ["please", "thanks"]),
      reactionEmoji("🤝", "Handshake", ["deal", "support", "agree"]),
      reactionEmoji("💪", "Flexed biceps", ["strong", "power"]),
      reactionEmoji("🫶", "Heart hands", ["care", "support"]),
      reactionEmoji("👌", "OK hand", ["ok", "perfect"]),
      reactionEmoji("🤌", "Pinched fingers", ["chef kiss", "perfect"]),
      reactionEmoji("👋", "Waving hand", ["hello", "bye"]),
      reactionEmoji("🤚", "Raised back hand", ["stop", "hand"]),
      reactionEmoji("✋", "Raised hand", ["stop", "hand"]),
      reactionEmoji("🖐️", "Hand with fingers splayed", ["hand", "five"]),
      reactionEmoji("🖖", "Vulcan salute", ["hello", "salute"]),
      reactionEmoji("✌️", "Victory hand", ["peace", "two"]),
      reactionEmoji("🤞", "Crossed fingers", ["hope", "luck"]),
      reactionEmoji("🫰", "Finger heart", ["love", "care"]),
      reactionEmoji("🤟", "Love-you gesture", ["love", "sign"]),
      reactionEmoji("🤘", "Rock hand", ["rock", "music"]),
      reactionEmoji("👈", "Point left", ["point", "left"]),
      reactionEmoji("👉", "Point right", ["point", "right"]),
      reactionEmoji("👆", "Point up", ["point", "up"]),
      reactionEmoji("👇", "Point down", ["point", "down"]),
      reactionEmoji("☝️", "Index up", ["point", "up"]),
      reactionEmoji("🫵", "Pointing at viewer", ["you", "point"]),
      reactionEmoji("✊", "Raised fist", ["power", "solidarity"]),
      reactionEmoji("👊", "Oncoming fist", ["bump", "power"]),
      reactionEmoji("🤛", "Left fist bump", ["bump", "fist"]),
      reactionEmoji("🤜", "Right fist bump", ["bump", "fist"]),
      reactionEmoji("🫳", "Palm down hand", ["hand", "drop"]),
      reactionEmoji("🫴", "Palm up hand", ["hand", "offer"]),
      reactionEmoji("🤲", "Palms up together", ["offer", "please"]),
      reactionEmoji("👐", "Open hands", ["open", "hug"]),
      reactionEmoji("💅", "Nail polish", ["style", "sass"]),
      reactionEmoji("🧠", "Brain", ["smart", "think"]),
      reactionEmoji("👀", "Eyes", ["watching", "looking"]),
      reactionEmoji("👂", "Ear", ["listen", "hear"]),
      reactionEmoji("🗣️", "Speaking head", ["talk", "speak"]),
      reactionEmoji("👤", "Bust silhouette", ["person", "user"]),
      reactionEmoji("👥", "Busts silhouettes", ["people", "group"]),
      reactionEmoji("🧑‍💻", "Technologist", ["work", "computer"]),
      reactionEmoji("🧑‍🎓", "Student", ["study", "learn"]),
      reactionEmoji("🧑‍🍳", "Cook", ["food", "cook"]),
      reactionEmoji("🫂", "People hugging", ["hug", "support"]),
    ],
  },
  {
    title: "Hearts & symbols",
    emojis: [
      reactionEmoji("❤️", "Red heart", ["love", "care", "warm"]),
      reactionEmoji("🧡", "Orange heart", ["love", "warm"]),
      reactionEmoji("💛", "Yellow heart", ["love", "happy"]),
      reactionEmoji("💚", "Green heart", ["love", "support"]),
      reactionEmoji("💙", "Blue heart", ["love", "calm"]),
      reactionEmoji("💜", "Purple heart", ["love", "care"]),
      reactionEmoji("🖤", "Black heart", ["love", "dark"]),
      reactionEmoji("🤍", "White heart", ["love", "pure"]),
      reactionEmoji("🤎", "Brown heart", ["love", "warm"]),
      reactionEmoji("💔", "Broken heart", ["sad", "hurt"]),
      reactionEmoji("❣️", "Heart exclamation", ["love", "emphasis"]),
      reactionEmoji("💕", "Two hearts", ["love", "sweet"]),
      reactionEmoji("💞", "Revolving hearts", ["love", "cute"]),
      reactionEmoji("💓", "Beating heart", ["love", "excited"]),
      reactionEmoji("💗", "Growing heart", ["love", "care"]),
      reactionEmoji("💖", "Sparkling heart", ["love", "sparkle"]),
      reactionEmoji("💘", "Heart with arrow", ["love", "crush"]),
      reactionEmoji("💝", "Heart with ribbon", ["gift", "love"]),
      reactionEmoji("💟", "Heart decoration", ["love", "symbol"]),
      reactionEmoji("✅", "Check mark", ["done", "yes", "complete"]),
      reactionEmoji("☑️", "Checked box", ["done", "check"]),
      reactionEmoji("✔️", "Heavy check mark", ["done", "yes"]),
      reactionEmoji("❌", "Cross mark", ["no", "wrong", "cancel"]),
      reactionEmoji("❎", "Cross box", ["no", "wrong"]),
      reactionEmoji("⚠️", "Warning", ["careful", "alert"]),
      reactionEmoji("🚫", "Prohibited", ["no", "blocked"]),
      reactionEmoji("💯", "Hundred points", ["perfect", "true"]),
      reactionEmoji("💥", "Collision", ["boom", "impact"]),
      reactionEmoji("💫", "Dizzy", ["stars", "wow"]),
      reactionEmoji("✨", "Sparkles", ["magic", "nice", "clean"]),
      reactionEmoji("⭐", "Star", ["star", "favorite"]),
      reactionEmoji("🌟", "Glowing star", ["star", "shine"]),
      reactionEmoji("⚡", "Lightning", ["fast", "energy"]),
      reactionEmoji("🔥", "Fire", ["hot", "great", "strong"]),
      reactionEmoji("🎯", "Bullseye", ["target", "exact"]),
      reactionEmoji("🔔", "Bell", ["notify", "reminder"]),
      reactionEmoji("💬", "Speech bubble", ["chat", "message"]),
      reactionEmoji("💭", "Thought bubble", ["think", "idea"]),
      reactionEmoji("🗯️", "Anger bubble", ["shout", "talk"]),
      reactionEmoji("💤", "Zzz", ["sleep", "tired"]),
    ],
  },
  {
    title: "Animals & nature",
    emojis: [
      reactionEmoji("🐶", "Dog face", ["dog", "pet"]),
      reactionEmoji("🐱", "Cat face", ["cat", "pet"]),
      reactionEmoji("🐭", "Mouse face", ["mouse", "cute"]),
      reactionEmoji("🐹", "Hamster face", ["hamster", "cute"]),
      reactionEmoji("🐰", "Rabbit face", ["rabbit", "cute"]),
      reactionEmoji("🦊", "Fox face", ["fox", "animal"]),
      reactionEmoji("🐻", "Bear", ["bear", "animal"]),
      reactionEmoji("🐼", "Panda", ["panda", "cute"]),
      reactionEmoji("🐨", "Koala", ["koala", "cute"]),
      reactionEmoji("🐯", "Tiger", ["tiger", "animal"]),
      reactionEmoji("🦁", "Lion", ["lion", "animal"]),
      reactionEmoji("🐮", "Cow", ["cow", "animal"]),
      reactionEmoji("🐷", "Pig", ["pig", "animal"]),
      reactionEmoji("🐸", "Frog", ["frog", "animal"]),
      reactionEmoji("🐵", "Monkey", ["monkey", "animal"]),
      reactionEmoji("🐧", "Penguin", ["penguin", "animal"]),
      reactionEmoji("🐦", "Bird", ["bird", "animal"]),
      reactionEmoji("🦆", "Duck", ["duck", "animal"]),
      reactionEmoji("🦉", "Owl", ["owl", "animal"]),
      reactionEmoji("🐢", "Turtle", ["turtle", "animal"]),
      reactionEmoji("🌱", "Seedling", ["plant", "grow"]),
      reactionEmoji("🌿", "Herb", ["plant", "nature"]),
      reactionEmoji("🍀", "Four leaf clover", ["luck", "green"]),
      reactionEmoji("🌵", "Cactus", ["plant", "desert"]),
      reactionEmoji("🌴", "Palm tree", ["tree", "travel"]),
      reactionEmoji("🌳", "Deciduous tree", ["tree", "nature"]),
      reactionEmoji("🌲", "Evergreen tree", ["tree", "nature"]),
      reactionEmoji("🌺", "Hibiscus", ["flower", "nature"]),
      reactionEmoji("🌸", "Cherry blossom", ["flower", "spring"]),
      reactionEmoji("🌼", "Blossom", ["flower", "nature"]),
      reactionEmoji("🌻", "Sunflower", ["flower", "sun"]),
      reactionEmoji("🌹", "Rose", ["flower", "love"]),
      reactionEmoji("🌷", "Tulip", ["flower", "spring"]),
      reactionEmoji("☀️", "Sun", ["sun", "bright"]),
      reactionEmoji("🌙", "Moon", ["night", "calm"]),
      reactionEmoji("🌧️", "Rain cloud", ["rain", "weather"]),
      reactionEmoji("⛈️", "Storm cloud", ["storm", "weather"]),
      reactionEmoji("❄️", "Snowflake", ["snow", "cold"]),
      reactionEmoji("☁️", "Cloud", ["cloud", "weather"]),
      reactionEmoji("🌊", "Wave", ["water", "sea"]),
      reactionEmoji("🔥", "Fire", ["hot", "great", "strong"]),
      reactionEmoji("🌈", "Rainbow", ["color", "nice"]),
      reactionEmoji("⭐", "Star", ["star", "favorite"]),
      reactionEmoji("⚡", "Lightning", ["fast", "energy"]),
    ],
  },
  {
    title: "Food & activity",
    emojis: [
      reactionEmoji("🍕", "Pizza", ["food", "slice"]),
      reactionEmoji("🍔", "Burger", ["food", "meal"]),
      reactionEmoji("🍟", "Fries", ["food", "snack"]),
      reactionEmoji("🌮", "Taco", ["food", "meal"]),
      reactionEmoji("🍣", "Sushi", ["food", "meal"]),
      reactionEmoji("🍜", "Noodles", ["food", "meal"]),
      reactionEmoji("🍝", "Spaghetti", ["food", "meal"]),
      reactionEmoji("🍗", "Poultry leg", ["food", "meal"]),
      reactionEmoji("🥗", "Green salad", ["food", "healthy"]),
      reactionEmoji("🍓", "Strawberry", ["fruit", "sweet"]),
      reactionEmoji("🍌", "Banana", ["fruit", "snack"]),
      reactionEmoji("🍎", "Apple", ["fruit", "snack"]),
      reactionEmoji("🥑", "Avocado", ["food", "healthy"]),
      reactionEmoji("🍩", "Doughnut", ["sweet", "food"]),
      reactionEmoji("🍪", "Cookie", ["sweet", "food"]),
      reactionEmoji("🍰", "Cake", ["sweet", "celebrate"]),
      reactionEmoji("🧁", "Cupcake", ["sweet", "celebrate"]),
      reactionEmoji("🍫", "Chocolate", ["sweet", "food"]),
      reactionEmoji("🍿", "Popcorn", ["movie", "snack"]),
      reactionEmoji("☕", "Coffee", ["drink", "cafe"]),
      reactionEmoji("🍵", "Tea", ["drink", "calm"]),
      reactionEmoji("🧋", "Bubble tea", ["drink", "tea"]),
      reactionEmoji("🥤", "Cup with straw", ["drink", "soda"]),
      reactionEmoji("🍻", "Beers", ["drink", "cheers"]),
      reactionEmoji("🥂", "Clinking glasses", ["cheers", "celebrate"]),
      reactionEmoji("🏀", "Basketball", ["sport", "game"]),
      reactionEmoji("⚽", "Football", ["sport", "game"]),
      reactionEmoji("🏈", "American football", ["sport", "game"]),
      reactionEmoji("⚾", "Baseball", ["sport", "game"]),
      reactionEmoji("🎾", "Tennis", ["sport", "game"]),
      reactionEmoji("🏐", "Volleyball", ["sport", "game"]),
      reactionEmoji("🏓", "Table tennis", ["sport", "game"]),
      reactionEmoji("🎮", "Video game", ["game", "play"]),
      reactionEmoji("🎲", "Game die", ["game", "play"]),
      reactionEmoji("♟️", "Chess pawn", ["game", "chess"]),
      reactionEmoji("🎧", "Headphones", ["music", "listen"]),
      reactionEmoji("🎤", "Microphone", ["music", "sing"]),
      reactionEmoji("🎵", "Musical note", ["music", "song"]),
      reactionEmoji("🎬", "Clapper board", ["movie", "film"]),
      reactionEmoji("📚", "Books", ["study", "read"]),
      reactionEmoji("💡", "Light bulb", ["idea", "smart"]),
      reactionEmoji("📍", "Map pin", ["location", "place"]),
      reactionEmoji("🏆", "Trophy", ["win", "award"]),
      reactionEmoji("🥇", "Gold medal", ["win", "first"]),
      reactionEmoji("🎁", "Gift", ["present", "celebrate"]),
      reactionEmoji("🎈", "Balloon", ["party", "celebrate"]),
      reactionEmoji("🎊", "Confetti ball", ["celebrate", "party"]),
      reactionEmoji("🎉", "Party popper", ["celebrate", "congrats"]),
      reactionEmoji("🚀", "Rocket", ["launch", "fast", "go"]),
      reactionEmoji("✈️", "Airplane", ["travel", "flight"]),
      reactionEmoji("🚗", "Car", ["travel", "drive"]),
      reactionEmoji("🏠", "House", ["home", "place"]),
      reactionEmoji("🏫", "School", ["study", "campus"]),
    ],
  },
] as const;

interface ChatEmojiPickerPanelProps {
  compact?: boolean;
  height?: number;
  onCollapse?: () => void;
  onSelect: (emoji: string) => void;
  searchDisabled?: boolean;
  showPreview?: boolean;
  skinTonesDisabled?: boolean;
  suggestedEmojis?: readonly string[];
}

export const ChatEmojiPickerPanel = memo(function ChatEmojiPickerPanel({
  compact = false,
  height,
  onCollapse,
  onSelect,
  searchDisabled = false,
  showPreview = false,
  skinTonesDisabled = true,
  suggestedEmojis = [],
}: ChatEmojiPickerPanelProps) {
  if (compact) {
    return (
      <CompactReactionEmojiPicker
        onSelect={onSelect}
        suggestedEmojis={suggestedEmojis}
      />
    );
  }

  const viewportHeightClass = getViewportHeightClass(compact, height);
  const components = compact
    ? COMPACT_EMOJI_LIST_COMPONENTS
    : DEFAULT_EMOJI_LIST_COMPONENTS;

  return (
    <EmojiPicker.Root
      className={
        compact ? EMOJI_PICKER_ROOT_COMPACT_CLASS : EMOJI_PICKER_ROOT_CLASS
      }
      columns={compact ? 8 : 9}
      onEmojiSelect={({ emoji }) => onSelect(emoji)}
      skinTone="none"
    >
      {!searchDisabled || !skinTonesDisabled ? (
        <div
          className={cn(
            "flex items-center gap-2 border-border/55 border-b",
            compact ? "p-1.5" : "px-2 pt-1.5 pb-0",
          )}
        >
          {onCollapse ? (
            <button
              type="button"
              aria-label="Back to quick reactions"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/55 bg-background/65 text-slate-muted transition-colors hover:border-forge-teal/35 hover:bg-forge-teal/8 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/18"
              onClick={onCollapse}
            >
              <ChevronLeft className="size-4" />
            </button>
          ) : null}
          {!searchDisabled ? (
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-muted"
                aria-hidden="true"
                strokeWidth={2}
              />
              <EmojiPicker.Search
                className={cn(
                  "h-8 w-full border-0 bg-transparent pr-2 pl-8 font-bold text-ink text-xs outline-none transition-colors placeholder:text-slate-muted/70 focus-visible:ring-0",
                  compact && "text-micro",
                )}
                name="emoji-search"
                aria-label="Search emoji"
                placeholder="Search emoji"
              />
            </div>
          ) : null}
          {!skinTonesDisabled ? (
            <EmojiPicker.SkinToneSelector className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/65 text-base transition-colors hover:border-forge-teal/35 hover:bg-forge-teal/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/18" />
          ) : null}
        </div>
      ) : null}

      <EmojiPicker.Viewport
        className={cn(
          "scrollbar-hide min-h-0 px-1 pt-0 pb-1 outline-none",
          viewportHeightClass,
        )}
      >
        <EmojiPicker.Loading className="block">
          <EmojiPickerSkeleton compact={compact} />
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="flex h-full items-center justify-center px-6 text-center font-semibold text-slate-muted text-xs">
          {({ search }) =>
            search.trim()
              ? `No emoji found for "${search.trim()}".`
              : "No emoji found."
          }
        </EmojiPicker.Empty>
        <EmojiPicker.List components={components} />
      </EmojiPicker.Viewport>

      {showPreview ? (
        <EmojiPicker.ActiveEmoji>
          {({ emoji }) => (
            <div className="flex min-h-11 items-center gap-2 border-border/55 border-t px-2.5 py-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-forge-teal/8 font-sans text-xl">
                {emoji?.emoji}
              </span>
              <span className="min-w-0 truncate font-bold text-slate-muted text-xs">
                {emoji?.label ?? "Pick an emoji"}
              </span>
            </div>
          )}
        </EmojiPicker.ActiveEmoji>
      ) : null}
    </EmojiPicker.Root>
  );
});

const EMOJI_PICKER_ROOT_CLASS =
  "w-full overflow-hidden bg-canvas/97 font-sans text-ink shadow-none dark:bg-forge-deep-surface/97";

const EMOJI_PICKER_ROOT_COMPACT_CLASS =
  "w-full overflow-hidden rounded-lg bg-transparent font-sans text-ink shadow-none";

const DEFAULT_EMOJI_LIST_COMPONENTS = {
  CategoryHeader: EmojiCategoryHeader,
  Emoji: EmojiButton,
  Row: EmojiRow,
} satisfies Partial<EmojiPickerListComponents>;

const COMPACT_EMOJI_LIST_COMPONENTS = {
  CategoryHeader: CompactEmojiCategoryHeader,
  Emoji: CompactEmojiButton,
  Row: CompactEmojiRow,
} satisfies Partial<EmojiPickerListComponents>;

function getViewportHeightClass(compact: boolean, height?: number) {
  if (height && height <= 184) {
    return "h-44";
  }

  if (height && height <= 256) {
    return "h-64";
  }

  if (height && height >= 328) {
    return "h-82";
  }

  if (height && height >= 320) {
    return "h-80";
  }

  return compact ? "h-64" : "h-72";
}

function CompactReactionEmojiPicker({
  onSelect,
  suggestedEmojis,
}: {
  onSelect: (emoji: string) => void;
  suggestedEmojis: readonly string[];
}) {
  const [search, setSearch] = useState("");
  const suggestedReactionEmojis = getSuggestedReactionEmojis(suggestedEmojis);
  const reactionGroups = getFilteredReactionGroups(
    search,
    suggestedReactionEmojis,
  );

  return (
    <div className={EMOJI_PICKER_ROOT_COMPACT_CLASS}>
      <div className="flex items-center gap-1.5 border-border/55 border-b px-2 pt-1.5 pb-0">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-1.5 size-3.5 -translate-y-1/2 text-slate-muted"
            aria-hidden="true"
            strokeWidth={2}
          />
          <input
            type="search"
            name="emoji-search"
            aria-label="Search emoji"
            value={search}
            className="h-8 w-full border-0 bg-transparent pr-2 pl-7 font-bold text-ink text-micro outline-none transition-colors placeholder:text-slate-muted/70 focus-visible:ring-0"
            placeholder="Search emoji"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      <div
        className={cn(
          "scrollbar-hide snap-y snap-mandatory scroll-pt-5 overflow-y-auto px-1 py-0",
          "h-40",
        )}
      >
        {reactionGroups.length > 0 ? (
          reactionGroups.map((group) => (
            <CompactReactionEmojiGroup
              key={group.title}
              group={group}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center font-semibold text-slate-muted text-xs">
            No emoji found.
          </div>
        )}
      </div>
    </div>
  );
}

function CompactReactionEmojiGroup({
  group,
  onSelect,
}: {
  group: ReactionEmojiGroup;
  onSelect: (emoji: string) => void;
}) {
  return (
    <section>
      <div className="sticky -top-px z-10 flex h-5 snap-start items-center bg-canvas/97 px-2 font-black text-micro text-slate-muted backdrop-blur-md dark:bg-forge-deep-surface/97">
        {group.title}
      </div>
      <div>
        {chunkReactionEmojis(group.emojis).map((row) => (
          <div
            key={`${group.title}-${row.map((emoji) => emoji.emoji).join("")}`}
            className="grid h-7 snap-start grid-cols-9 gap-0 px-1"
          >
            {row.map((emoji) => (
              <button
                key={`${group.title}-${emoji.emoji}-${emoji.label}`}
                type="button"
                aria-label={`Use ${emoji.label}`}
                className="flex h-full items-center justify-center rounded-md text-base leading-none transition-colors hover:bg-forge-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/18"
                title={emoji.label}
                onClick={() => onSelect(emoji.emoji)}
              >
                <span aria-hidden="true">{emoji.emoji}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function chunkReactionEmojis(emojis: readonly ReactionEmoji[]) {
  const rows: ReactionEmoji[][] = [];

  for (
    let index = 0;
    index < emojis.length;
    index += COMPACT_REACTION_COLUMNS
  ) {
    rows.push(emojis.slice(index, index + COMPACT_REACTION_COLUMNS));
  }

  return rows;
}

function getSuggestedReactionEmojis(suggestedEmojis: readonly string[]) {
  if (suggestedEmojis.length === 0) {
    return SUGGESTED_REACTION_EMOJIS;
  }

  return suggestedEmojis.map((emoji) => {
    return (
      SUGGESTED_REACTION_EMOJIS.find((item) => item.emoji === emoji) ??
      reactionEmoji(emoji, emoji, [])
    );
  });
}

function getFilteredReactionGroups(
  search: string,
  suggestedReactionEmojis: readonly ReactionEmoji[],
) {
  const groups: ReactionEmojiGroup[] = [
    { title: "Suggested", emojis: suggestedReactionEmojis },
    ...COMPACT_REACTION_GROUPS,
  ];
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return groups;
  }

  return groups
    .map((group) => {
      const emojis = group.emojis.filter((emoji) =>
        getReactionEmojiSearchText(emoji).includes(normalizedSearch),
      );

      return { title: group.title, emojis };
    })
    .filter((group) => group.emojis.length > 0);
}

function getReactionEmojiSearchText(emoji: ReactionEmoji) {
  return `${emoji.emoji} ${emoji.label} ${emoji.tags.join(" ")}`.toLowerCase();
}

function reactionEmoji(
  emoji: string,
  label: string,
  tags: readonly string[],
): ReactionEmoji {
  return { emoji, label, tags };
}

function EmojiCategoryHeader(props: EmojiPickerListCategoryHeaderProps) {
  return <EmojiCategoryHeaderBase {...props} compact={false} />;
}

function CompactEmojiCategoryHeader(props: EmojiPickerListCategoryHeaderProps) {
  return <EmojiCategoryHeaderBase {...props} compact />;
}

function EmojiCategoryHeaderBase({
  category,
  className,
  compact,
  ...props
}: EmojiPickerListCategoryHeaderProps & { compact: boolean }) {
  return (
    <div
      {...props}
      className={cn(
        "z-10 flex items-center bg-canvas/94 px-2 font-black text-slate-muted text-xs backdrop-blur-md dark:bg-forge-deep-surface/94",
        compact ? "h-5 text-micro" : "h-6 text-xs",
        className,
      )}
    >
      {category.label}
    </div>
  );
}

function EmojiRow(props: EmojiPickerListRowProps) {
  return <EmojiRowBase {...props} compact={false} />;
}

function CompactEmojiRow(props: EmojiPickerListRowProps) {
  return <EmojiRowBase {...props} compact />;
}

function EmojiRowBase({
  className,
  compact,
  ...props
}: EmojiPickerListRowProps & { compact: boolean }) {
  return (
    <div
      {...props}
      className={cn("gap-0.5 px-1", compact && "gap-0 px-0.5", className)}
    />
  );
}

function EmojiButton(props: EmojiPickerListEmojiProps) {
  return <EmojiButtonBase {...props} compact={false} />;
}

function CompactEmojiButton(props: EmojiPickerListEmojiProps) {
  return <EmojiButtonBase {...props} compact />;
}

function EmojiButtonBase({
  className,
  compact,
  emoji,
  ...props
}: EmojiPickerListEmojiProps & { compact: boolean }) {
  return (
    <button
      {...props}
      type="button"
      className={cn(
        "flex min-w-0 flex-1 items-center justify-center rounded-md text-lg leading-none transition-colors hover:bg-forge-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/18",
        compact ? "h-7 text-base" : "h-8",
        emoji.isActive && "bg-spark-amber/14",
        className,
      )}
    >
      <span aria-hidden="true">{emoji.emoji}</span>
    </button>
  );
}

function EmojiPickerSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cn("p-2", compact && "p-1.5")}>
      <div
        className={cn("mb-2 h-6 rounded-md bg-muted/70", !compact && "h-7")}
      />
      <div className={cn("grid grid-cols-9 gap-1", compact && "grid-cols-8")}>
        {EMOJI_SKELETON_CELLS.map((cell) => (
          <div key={cell} className="aspect-square rounded-md bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
