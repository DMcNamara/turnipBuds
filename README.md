# Turnip Buds

![build](https://github.com/DMcNamara/turnipBuds/workflows/Test/badge.svg)
[![redux channel on discord](https://img.shields.io/badge/discord-TurnipBuds-61DAFB.svg?style=flat-square)](https://discord.gg/3WTnPhs)

![focus](https://github.com/user-attachments/assets/de7df288-3508-41fb-8147-3c10426f172b)


Repo for Turnip Buds, a companion app for Animal Crossing: New Horizons, previously available on iOS and Android.
Created using React Native, Firebase Firestore, Expo, and TypeScript 

![Simulator Screen Shot - iPhone 11 Pro Max - 2020-05-19 at 14 30 27](https://github.com/user-attachments/assets/3a58b826-5442-45bb-9fac-550f63f079e4)
![Simulator Screen Shot - iPhone 11 Pro Max - 2020-05-19 at 14 35 57](https://github.com/user-attachments/assets/f6ce60ec-f9cc-4618-89a2-00967760c88a)
![Simulator Screen Shot - iPhone 11 Pro Max - 2020-05-19 at 14 39 35](https://github.com/user-attachments/assets/58f24206-fb13-44de-9809-9a79fc82c750)
![Simulator Screen Shot - iPhone 11 Pro Max - 2020-05-19 at 14 40 00](https://github.com/user-attachments/assets/10a1167a-1ec7-4c90-b223-b0c191484592)

## Getting Setup
- `yarn install && cd functions && npm install`
- copy app.config.example to app.config.ts, set up Firebase project and fill in env vars
- `npx firebase login`
- run `yarn export` or copy over old fsData to seed simulator
- `yarn dev` to start simulators
