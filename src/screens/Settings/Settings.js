import { useCallback, useState } from "react"
import { Image, Pressable, StyleSheet, Switch, Text, View } from "react-native"
import colors from "../../../colors"
import { useAtom } from "jotai"
import { store } from "../../store"
import DropDownPicker from "react-native-dropdown-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { formatTime } from "../../utils"
import { useTranslation } from "react-i18next"

export default function Settings({ navigation }) {
  const [selectedTab, setSelectedTab] = useState(0)

  const [data, setData] = useAtom(store)

  const { t, i18n } = useTranslation()

  const tabs = [t("namespace.Settings"), t("namespace.Records")]

  const darkMode = data.darkMode
  const vibration = data.vibration

  const [openDifficulties, setOpenDifficulties] = useState(false)
  const [difficulties, setDifficulties] = useState([
    { label: t("namespace.Easy"), value: 0 },
    { label: t("namespace.Medium"), value: 1 },
    { label: t("namespace.Hard"), value: 2 }
  ])

  const [openLanguages, setOpenLanguages] = useState(false)
  const [languages, setLanguages] = useState([
    { label: "English", value: "en" },
    { label: "Türkçe", value: "tr" }
  ])

  const onLanguagesOpen = useCallback(() => {
    setOpenDifficulties(false)
  }, [])

  const onDifficultiesOpen = useCallback(() => {
    setOpenLanguages(false)
  }, [])

  function changeTheme(isDarkMode) {
    AsyncStorage.setItem("DarkMode", JSON.stringify(isDarkMode)).catch(
      (err) => {
        console.error("error on save DarkMode", err)
      }
    )
    setData((d) => ({ ...d, darkMode: isDarkMode }))
  }

  function changeDifficulty(selectedDifficulty) {
    let newDifficulty = selectedDifficulty()
    AsyncStorage.setItem("Difficulty", JSON.stringify(newDifficulty)).catch(
      (err) => {
        console.error("error on save Difficulty", err)
      }
    )
    setData((data) => ({ ...data, difficulty: newDifficulty }))
  }

  function changeLanguage(selectedLanguage) {
    let newLanguage = selectedLanguage()
    i18n.changeLanguage(newLanguage)
    AsyncStorage.setItem("Language", JSON.stringify(newLanguage)).catch(
      (err) => {
        console.error("error on save Language", err)
      }
    )
    setData((data) => ({ ...data, language: newLanguage }))
    setDifficulties([
      { label: t("namespace.Easy"), value: 0 },
      { label: t("namespace.Medium"), value: 1 },
      { label: t("namespace.Hard"), value: 2 }
    ])
  }

  function changeVibration() {
    AsyncStorage.setItem("Vibration", JSON.stringify(!vibration)).catch(
      (err) => {
        console.error("error on save Vibration", err)
      }
    )
    setData((data) => ({ ...data, vibration: !vibration }))
  }

  return (
    <View style={styles.container(darkMode)}>
      <View style={styles.dashboard}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../../../assets/arrow.png")}
            style={styles.back(darkMode)}
          />
        </Pressable>

        {tabs.map((item, index) => {
          const isActive = index === selectedTab

          return (
            <View style={styles.tab} key={index}>
              <Pressable
                onPress={() => {
                  setSelectedTab(index)
                }}
              >
                <View style={styles.item(darkMode, isActive)}>
                  <Text style={styles.tabText(darkMode, isActive)}>{item}</Text>
                </View>
              </Pressable>
            </View>
          )
        })}
      </View>

      <View style={styles.main}>
        {selectedTab === 0 ? (
          <>
            <View style={styles.row}>
              <Text style={styles.text(darkMode)}>
                {t("namespace.Darkmode")}
              </Text>
              <Switch
                thumbColor={colors.tileOpened}
                trackColor={{
                  true: colors.tileClosed,
                  false: darkMode ? colors.white : colors.dark
                }}
                onValueChange={changeTheme}
                value={darkMode}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.text(darkMode)}>
                {t("namespace.Difficulty")}
              </Text>
              <DropDownPicker
                zIndex={2}
                open={openDifficulties}
                onOpen={onDifficultiesOpen}
                value={data.difficulty}
                items={difficulties}
                setOpen={setOpenDifficulties}
                setValue={changeDifficulty}
                theme={darkMode ? "LIGHT" : "DARK"}
                containerStyle={styles.dropDownPicker}
                style={styles.dropDownPickerStyle(darkMode)}
                dropDownContainerStyle={styles.dropDownPickerStyle(darkMode)}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.text(darkMode)}>
                {t("namespace.Languages")}
              </Text>
              <DropDownPicker
                zIndex={1}
                open={openLanguages}
                onOpen={onLanguagesOpen}
                value={data.language}
                items={languages}
                setOpen={setOpenLanguages}
                setValue={changeLanguage}
                theme={darkMode ? "LIGHT" : "DARK"}
                containerStyle={styles.dropDownPicker}
                style={styles.dropDownPickerStyle(darkMode)}
                dropDownContainerStyle={styles.dropDownPickerStyle(darkMode)}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.text(darkMode)}>
                {t("namespace.Vibration")}
              </Text>
              <Switch
                thumbColor={colors.tileOpened}
                trackColor={{
                  true: colors.tileClosed,
                  false: darkMode ? colors.white : colors.dark
                }}
                onValueChange={changeVibration}
                value={vibration}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.feedbackText(darkMode)}>{`${t(
              "namespace.Easy"
            )}: ${
              data.records.e
                ? formatTime(data.records.e)
                : t("namespace.notset")
            }`}</Text>
            <Text style={styles.feedbackText(darkMode)}>{`${t(
              "namespace.Medium"
            )}: ${
              data.records.m
                ? formatTime(data.records.m)
                : t("namespace.notset")
            }`}</Text>
            <Text style={styles.feedbackText(darkMode)}>{`${t(
              "namespace.Hard"
            )}: ${
              data.records.h
                ? formatTime(data.records.h)
                : t("namespace.notset")
            }`}</Text>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: (isDarkMode) => ({
    flex: 1,
    backgroundColor: isDarkMode ? colors.dark : colors.white,
    alignItems: "center",
    paddingHorizontal: 16
  }),

  dashboard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30
  },

  back: (darkMode) => ({
    height: 30,
    width: 30,
    tintColor: darkMode ? colors.white : colors.dark
  }),

  tab: { flex: 1 },

  tabText: (darkMode, isActive) => ({
    color: isActive ? colors.tileOpened : darkMode ? colors.white : colors.dark,
    fontSize: 32,
    fontWeight: "700"
  }),

  item: (darkMode, isActive) => ({
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderColor: isActive
      ? colors.tileOpened
      : darkMode
      ? colors.dark
      : colors.white,
    borderBottomWidth: 2
  }),

  main: {
    flex: 1,
    width: "100%",
    justifyContent: "space-evenly"
  },

  feedbackText: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 24,
    fontWeight: "600"
  }),

  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  text: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 28
  }),

  dropDownPicker: { width: "40%" },

  dropDownPickerStyle: (darkMode) => ({
    backgroundColor: darkMode ? colors.white : colors.dark
  })
})
