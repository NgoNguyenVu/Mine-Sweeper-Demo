import { StatusBar } from "expo-status-bar"
import { useEffect, useState, useCallback } from "react"
import { StyleSheet, Text, View, Image, Pressable } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import * as SplashScreen from "expo-splash-screen"
import Dashboard from "../../components/dashboard"
import options from "../../../options.json"
import colors from "../../../colors"
import Table from "../../components/table"
import { useAtom, useAtomValue } from "jotai"
import { store } from "../../store"
import useInterval from "use-interval"
import { formatTime } from "../../utils"
import { useIsFocused } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import "../../locales/inedex"

export default function Game({ navigation }) {
  const [isPlay, setIsPlay] = useState(true)
  const [isFirst, setIsFirst] = useState(true)
  const [time, setTime] = useState(0)
  const difficulty = useAtomValue(store).difficulty
  const [numOfFlags, setNumOfFlag] = useState(0)
  const [data, setData] = useAtom(store)
  const isDarkMode = data.darkMode
  const isFocused = useIsFocused()

  const { t, i18n } = useTranslation()

  const [appIsReady, setAppIsReady] = useState(false)
  const [table, setTable] = useState([[]])

  function generateTable() {
    setIsPlay(true)
    setIsFirst(true)

    const field = new Array(options[difficulty].tableLength)

    for (let i = 0; i < options[difficulty].tableLength; ++i)
      field[i] = new Array(options[difficulty].tableLength)

    for (let i = 0; i < options[difficulty].tableLength; ++i) {
      for (let j = 0; j < options[difficulty].tableLength; ++j) {
        field[i][j] = {
          isMine: false,
          row: i,
          column: j,
          numberOfAdjacentMines: 0,
          isPressed: false,
          isFlagged: false
        }
      }
    }

    return field
  }

  function onReset() {
    setTime(0)
    setTable(generateTable())
    setNumOfFlag(0)
  }

  useEffect(() => {
    ;(async function prepare() {
      try {
        const dif = await AsyncStorage.getItem("Difficulty")
        if (dif !== null) {
          setData((d) => ({ ...d, difficulty: JSON.parse(dif) }))
        }
        const darkMode = await AsyncStorage.getItem("DarkMode")
        if (darkMode !== null) {
          setData((d) => ({ ...d, darkMode: JSON.parse(darkMode) }))
        }
        const records = await AsyncStorage.getItem("Records")
        if (records !== null) {
          setData((d) => ({ ...d, records: JSON.parse(records) }))
        }
        const vibration = await AsyncStorage.getItem("Vibration")
        if (vibration !== null) {
          setData((d) => ({ ...d, vibration: JSON.parse(vibration) }))
        }
        const language = await AsyncStorage.getItem("Language")
        if (language !== null) {
          setData((d) => ({ ...d, language: JSON.parse(language) }))
          i18n.changeLanguage(JSON.parse(language))
        }
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    })()

    setTable(generateTable())
  }, [])

  useEffect(() => {
    onReset()
  }, [difficulty])

  useInterval(
    () => setTime((t) => t + 1),
    isPlay && !isFirst && isFocused && 1000
  )

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <View style={styles.container(isDarkMode)} onLayout={onLayoutRootView}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View style={styles.topSide}>
        <Pressable onPress={onReset}>
          <Image
            source={require("../../../assets/reset.png")}
            style={styles.icon(isDarkMode)}
          />
        </Pressable>

        <Text style={styles.timer(isDarkMode)}>{formatTime(time)}</Text>

        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Image
            source={require("../../../assets/setting.png")}
            style={styles.icon(isDarkMode)}
          />
        </Pressable>
      </View>

      <Dashboard numOfFlags={numOfFlags} />

      <Table
        table={table}
        setTable={setTable}
        isFirst={isFirst}
        setIsFirst={setIsFirst}
        isPlay={isPlay}
        setIsPlay={setIsPlay}
        setNumOfFlag={setNumOfFlag}
        time={time}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: (darkMode) => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 25,
    backgroundColor: darkMode ? colors.dark : colors.white
  }),

  timer: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 45,
    fontWeight: "bold",
    textAlign: "center"
  }),

  topSide: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around"
  },

  icon: (darkMode) => ({
    marginTop: 7,
    height: 45,
    aspectRatio: 1,
    tintColor: darkMode ? colors.white : colors.dark
  })
})
