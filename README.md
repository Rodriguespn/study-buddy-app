# Study Buddy - Language Learning ChatGPT App

I travel a lot, and one thing I always look forward to when abroad is learning the local language. Whether I'm ordering coffee in Paris, navigating the streets of Berlin, or bargaining at a market in Barcelona, knowing even a few words makes every trip more meaningful. That's why I built Study Buddy - a flashcard app that turns ChatGPT into my personal language tutor, helping me study vocabulary during my travels.

Create your own decks in **Spanish**, **French**, **German**, **Italian**, or **Portuguese**. Choose from three difficulty levels (beginner, intermediate, advanced) and organize your cards by category - from food and travel to business and greetings. Then let ChatGPT guide you through interactive study sessions with flip animations and progress tracking.

Built with [Supabase](https://supabase.com) and hosted on [Alpic.ai](https://alpic.ai).

## Demo

![App Usage GIF](./assets/demo.gif)

Try the app live: [study-buddy.alpic.live](https://study-buddy.alpic.live/)

## Features

- **5 Languages**: Spanish, French, German, Italian, Portuguese
- **3 Difficulty Levels**: Beginner, Intermediate, Advanced
- **10 Categories**: Food, Travel, Business, Greetings, Numbers, Colors, Animals, Family, Weather, Other
- **Persistent Decks**: Save your flashcard decks and access them anytime
- **Interactive Study Sessions**: Flip cards, track progress, and learn at your own pace

## Tools

### searchDeck
Search for existing decks by language, difficulty, and/or category. This is the starting point when you want to study - it finds matching decks from your saved collection.

### saveDeck
Save a new flashcard deck to your collection. Give it a name, choose the language, difficulty, and category, then add your flashcards with words and translations.

### listDecks (Widget)
Display all your saved flashcard decks in an interactive UI. Browse your collection, select a deck to study, or create a new one.

### startStudySessionFromDeck (Widget)
Start a study session using one of your saved decks. This loads the deck and presents interactive flashcards for studying.

### startStudySessionFromScratch (Widget)
Start a quick, temporary study session without saving. Perfect for one-off practice when you don't need to keep the deck.

## Resources

- [Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Alpic Documentation](https://docs.alpic.ai/)
