<div align="center">
  <img src="https://media.giphy.com/media/10YWA8gW28JbqM/giphy.gif" alt="Student Loans Debt GIF">
</div>

<p align="center"><a href="https://giphy.com/gifs/mic-student-loans-debt-loan-forgiveness-10YWA8gW28JbqM">via GIPHY</a></p>

# DormDeal 🎓

College is expensive, but campus life doesn't have to be. DormDeal is the app where students buy, sell, borrow, and help each other, making everyday college life more affordable.

## Summary 📋

DormDeal is a mobile marketplace built exclusively for college students, verified through Microsoft Outlook .edu sign-in. Students can buy and sell textbooks, furniture, dorm supplies, and electronics within a trusted campus community. Unlike Facebook Marketplace or OfferUp, every user is a verified student, creating a baseline of trust only DormDeal offers.

DormDeal also supports ride-sharing to grocery stores and airports, service listings (tutoring, tech help, moving), item borrowing, and an event posting feature — making it a full campus peer-to-peer experience rather than a single-use marketplace.

## MVP 🏆

- .edu verification
  - Probably won't be able to get student verification w/o getting Microsoft App approval, so focus here is to get Outlook sign-in through Microsoft Graph
- Buy & sell listings
  - Heavily inspired by Facebook Marketplace structure
- Rideshare
  - Carpools to grocery stores, airports, off-campus events
- In-app chat
- Trust score for users across all exchange types
- Services marketplace
  - Tutoring, tech help, moving, etc.
- Event posting feature

## Stretch Goals 💪

- Public meetup suggestions
- Borrowing items
- CV item classification
  - Auto-detect category and condition from a photo
- Price recommendation engine
- Organization accounts

## Timeline 📆

<details>
  <summary>Week 1: Set Up ⚙️</summary>

  **All**
  - Decide focus features, brainstorm ideas
  - GitHub practice & branches made

  **Front End**
  - Decide app flow
  - Figma wireframing

  **Back End**
  - Research backend stack
  - Design schema
  - Figma wireframing
<br></details>

<details>
  <summary>Week 2: More Preparation 💡</summary>

  **Front End**
  - Finalize wireframes for all screens
  - Finalize color palette and logo design

  **Back End**
  - Microsoft Graph OAuth setup
  - API research implementation
<br></details>

<details>
  <summary>Week 3: Coding Begins 👨🏻‍💻</summary>

  **Front End**
  - Signup/Login screens
  - "Connecting account…" screen
  - Home feed skeleton UI

  **Back End**
  - Fetch and store user profile
  - Initialize PostgreSQL schema
<br></details>

<details>
  <summary>Week 4: Listings 📸</summary>

  **Front End**
  - Listing creation screen (photo, category, condition, price)
  - Tag badges for listing type

  **Back End**
  - Photo upload
  - Listing write to database
  - Category and condition tagging logic
<br></details>

<details>
  <summary>Week 5: Browse & Ride 🚗</summary>

  **Front End**
  - Browse/search listings UI
  - Listing detail screen
  - Ride post UI

  **Back End**
  - Browse and search API
  - Rideshare listing logic
  - Trust score foundation
<br></details>

<details>
  <summary>Week 6: Chat & Services 💬</summary>

  **Front End**
  - In-app chat UI
  - Services marketplace screen
  - Event posting screen

  **Back End**
  - WebSocket chat backend
  - Services listing logic
  - Event post API
  - Set up demo account
<br></details>

<details>
  <summary>Week 7: Finishing Touches 👔</summary>

  **All**
  - Watch previous ACM presentations for inspo
  - Begin brainstorming presentation script

  **Front End**
  - Loading states and polish
  - Final feature touches
  - Fix integration issues

  **Back End**
  - Last integrations
  - Demo data (10+ listings, rides, services)
<br></details>

<details>
  <summary>Week 8: Presentation Prep 🎤</summary>

  **All**
  - Full team run-through

  **Front End**
  - Presentation slides and script
  - Assign speaking parts

  **Back End**
  - Finished video/demo recorded
  - Last bug fixes
<br></details>

<details>
  <summary>Week 9: Wrapping Up 🗣️🖥️</summary>

  **All**
  - Final slide edits
  - Speaker transitions
  - Q&A prep
<br></details>

**MOCKS → THANKSGIVING BREAK → PRESENTATION NIGHT**

## Tech Stack & Resources 💻

#### Start here!

- What is a frontend?
- What is a backend?
- How to Build a Chrome Extension

#### Frontend

- React Native + Expo
- TypeScript
- Figma
- Need help choosing colors?
- Look at other UI for inspo
- Intro to Design

#### Backend

- Node.js + Express
- PostgreSQL (Supabase)
- Socket.io
- AWS S3
- Microsoft Graph API
- Designing a Database
- Node.js docs
- Swagger

## Roadblocks & Solutions 🚧

**Microsoft Graph OAuth**
- Student email verification requires Microsoft App approval, which can block auth entirely in early weeks → focus on just Outlook verification, submit app request Week 1 if team agrees it's a priority.

**Listing volume for demo**
- Edit database with realistic fake listings in Week 7. Prepare 3–4 demo accounts with different trust scores before the demo.

**WebSocket chat complexity**
- Real-time state is tricky → use Socket.io, which abstracts the hard parts. Build a simple 1:1 chat first, add group chat as a stretch goal.

## Competition 🥊

**Facebook Marketplace**
- Largest existing platform for local buy/sell
- No student verification — meeting strangers carries real safety risk
- No campus filter, no rides or services, no trust layer

**Craigslist**
- Classified ads for local exchange, widely known
- No accounts, no reputation system, outdated UI
- Not built for students — dangerous for first-time renters and buyers

**UTD Sell/Trade Discord**
- Informal buy/sell happens in student chat groups right now
- Chaotic, unsearchable, no payment layer, no accountability

## Git Commands 🤖

| Command                       | What it does                        |
| ----------------------------- | ------------------------------------ |
| git branch                    | lists all the branches              |
| git branch "branch name"      | makes a new branch                  |
| git checkout "branch name"    | switches to specified branch        |
| git add .                     | finds all changed files             |
| git commit -m "Testing123"    | commit with a message               |
| git push                      | push to branch                      |
| git pull "branch"             | pull updates from a specific branch |

## Team DormDeal 😆

**Developers**
- Minh Do
- Saloni Roy
- Sai Kottamasu
- Bhargavi Nigam

**Project Manager**
- Tramanh Trinh

**Industry Mentor**
- Faiza Rahman