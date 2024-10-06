import { atom } from "jotai"
import { Appearance } from "react-native"

export const store = atom({
  darkMode: Appearance.getColorScheme() === "dark",
  difficulty: 0,
  language: "en",
  records: {
    e: 0,
    m: 0,
    h: 0
  },
  vibration: true
})
