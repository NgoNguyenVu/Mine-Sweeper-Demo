import { useCallback, useState } from "react"
import { Image, Pressable, StyleSheet, Switch, Text, View, Vibration,ScrollView  } from "react-native"
import colors from "../../../colors"
import { useAtom } from "jotai"
import { store } from "../../store"
import DropDownPicker from "react-native-dropdown-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { formatTime } from "../../utils"
import { useTranslation } from "react-i18next"
import { signOut } from 'firebase/auth'; // Đảm bảo import signOut
import { auth } from '../../firebaseConfig'; // Đảm bảo đường dẫn import là chính xác

export default function Settings({ navigation }) {
  const [selectedTab, setSelectedTab] = useState(0)

  const [data, setData] = useAtom(store)

  const { t, i18n } = useTranslation()

  const tabs = [t("namespace.Settings"), t("namespace.Guides")] // Giữ lại tab Records nhưng sẽ không hiển thị nội dung

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
    { label: "Tiếng Việt", value: "tr" }
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
    const newVibration = !vibration;
    AsyncStorage.setItem("Vibration", JSON.stringify(newVibration)).catch(
      (err) => {
        console.error("error on save Vibration", err);
      }
    );
    
    // Gọi rung nếu bật rung
    if (newVibration) {
      Vibration.vibrate(100); // rung trong 100ms
    }

    setData((data) => ({ ...data, vibration: newVibration }));
  }

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sử dụng signOut
      navigation.replace('Login'); // Chuyển hướng đến trang đăng nhập
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };
  
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
          const isActive = index === selectedTab;

          return (
            <View style={styles.tab} key={index}>
              <Pressable
                onPress={() => {
                  setSelectedTab(index);
                }}
              >
                <View style={styles.item(darkMode, isActive)}>
                  <Text style={styles.tabText(darkMode, isActive)}>
                    {item}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
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
                  false: darkMode ? colors.white : colors.dark,
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
                  false: darkMode ? colors.white : colors.dark,
                }}
                onValueChange={changeVibration}
                value={vibration}
              />
            </View>
          </>
        ) : (
              <ScrollView style={styles.guidesContainer}>
                <Text style={styles.guideTitle(darkMode)}>
                  {t("namespace.MinesweeperGuide.title")}
                </Text>
                <Text style={styles.guideSubtitle(darkMode)}>
                  {t("namespace.MinesweeperGuide.objectiveTitle")}
                </Text>
                <Text style={styles.guideText(darkMode)}>
                  {t("namespace.MinesweeperGuide.objective")}
                </Text>

                <Text style={styles.guideSubtitle(darkMode)}>
                  {t("namespace.MinesweeperGuide.howToPlayTitle")}
                </Text>
                <Text style={styles.guideText(darkMode)}>
                  {t("namespace.MinesweeperGuide.howToPlay")}
                </Text>

                <Text style={styles.guideSubtitle(darkMode)}>
                  {t("namespace.MinesweeperGuide.flaggingTitle")}
                </Text>
                <Text style={styles.guideText(darkMode)}>
                  {t("namespace.MinesweeperGuide.flagging")}
                </Text>

                <Text style={styles.guideSubtitle(darkMode)}>
                  {t("namespace.MinesweeperGuide.gameEndTitle")}
                </Text>
                <Text style={styles.guideText(darkMode)}>
                  {t("namespace.MinesweeperGuide.gameEnd")}
                </Text>

                <Text style={styles.guideSubtitle(darkMode)}>
                  {t("namespace.MinesweeperGuide.tricksTitle")}
                </Text>
                <Text style={styles.guideText(darkMode)}>
                  {t("namespace.MinesweeperGuide.trick1")}
                </Text>
                <Text style={styles.guideText(darkMode)}>
                  {t("namespace.MinesweeperGuide.trick2")}
                </Text>
              </ScrollView>

        )}
      </View>

      {selectedTab === 0 && (
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("Logout")}</Text>
        </Pressable>
      )}

    </View>
  );
}

// Enhanced styles
const styles = StyleSheet.create({
  container: (isDarkMode) => ({
    flex: 1,
    backgroundColor: isDarkMode ? colors.dark : colors.white,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  }),

  dashboard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
  },

  back: (darkMode) => ({
    height: 30,
    width: 30,
    tintColor: darkMode ? colors.white : colors.dark,
  }),

  tab: { flex: 1 },

  tabText: (darkMode, isActive) => ({
    color: isActive ? colors.tileOpened : darkMode ? colors.white : colors.dark,
    fontSize: 24,
    fontWeight: "700",
  }),

  item: (darkMode, isActive) => ({
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: isActive ? colors.tileOpened : darkMode ? colors.white : colors.dark,
    backgroundColor: isActive ? (darkMode ? colors.darkLight : colors.light) : 'transparent',
  }),

  main: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    paddingVertical: 10,
  },

  feedbackText: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 5,
  }),

  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 58,
  },

  text: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 20,
  }),

  dropDownPicker: { width: "40%" },

  dropDownPickerStyle: (darkMode) => ({
    backgroundColor: darkMode ? colors.white : colors.dark,
    borderColor: darkMode ? colors.dark : colors.white,
  }),

  logoutButton: {
    marginBottom: 40, // Đẩy nút lên cao hơn
    paddingVertical: 18, // Tăng chiều cao nút
    paddingHorizontal: 50, // Tăng chiều rộng nút
    backgroundColor: '#FF4B5C', // Màu đỏ tươi sáng hơn
    borderRadius: 30, // Tạo góc bo tròn nhiều hơn
    alignItems: 'center',
    width: '80%',
    elevation: 5, // Tăng cường bóng đổ cho Android
    shadowColor: '#000', // Bóng đổ cho iOS
    shadowOffset: { width: 0, height: 5 }, // Đổ bóng mạnh hơn
    shadowOpacity: 0.4, // Tăng độ đậm của bóng
    shadowRadius: 10, // Tăng bán kính bóng
  },
  
  logoutText: {
    color: 'white',
    fontSize: 20, // Tăng kích thước chữ
    fontWeight: 'bold',
    letterSpacing: 1, // Thêm khoảng cách giữa các chữ cái
  },

  guidesContainer: {
    padding: 20,
  },
  
  guideTitle: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  }),

  guideSubtitle: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 8,
  }),

  guideText: (darkMode) => ({
    color: darkMode ? colors.white : colors.dark,
    fontSize: 18,
    marginVertical: 4,
    lineHeight: 24,
  }),
  
});
