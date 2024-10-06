import { View, Image, Text, StyleSheet } from "react-native"
import options from "../../options.json"
import { useAtomValue } from "jotai"
import { store } from "../store"
import colors from "../../colors"

export default function Dashboard({ numOfFlags }) {
  const difficulty = useAtomValue(store).difficulty

  const numOfActiveMines = options[difficulty].numberOfMine - numOfFlags

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <Text style={styles.text}>{options[difficulty].numberOfMine}</Text>
        <Image source={require("../../assets/mine.png")} style={styles.icon} />
      </View>

      <Text style={styles.text}>-</Text>

      <View style={styles.group}>
        <Text style={styles.text}>{numOfFlags}</Text>
        <Image
          source={require("../../assets/redFlag.png")}
          style={styles.icon}
        />
      </View>

      <Text style={styles.text}>=</Text>

      <Text style={styles.text}>{numOfActiveMines}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "80%",
    backgroundColor: colors.lightgrey,
    paddingVertical: 8,
    borderRadius: 6
  },

  group: { flexDirection: "row" },

  text: { fontSize: 28 },

  icon: {
    width: 30,
    aspectRatio: 1,
    resizeMode: "contain",
    marginLeft: 5,
    marginTop: 5
  }
})
