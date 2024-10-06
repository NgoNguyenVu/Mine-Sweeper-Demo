import { View, Image, Text, StyleSheet } from "react-native";
import options from "../../options.json";
import { useAtomValue,useAtom  } from "jotai";
import { store, clickCountAtom  } from "../store";
import colors from "../../colors";

export default function Dashboard() { 
  const difficulty = useAtomValue(store).difficulty;
  const [clickCount] = useAtom(clickCountAtom);

  // Chỉ hiển thị số mìn
  const totalMines = options[difficulty].numberOfMine;

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <Text style={styles.text}>{totalMines}</Text>
        <Image source={require("../../assets/mine.png")} style={styles.icon} />
      </View>
      <View style={styles.group}>
        <Text style={styles.text}>{clickCount}</Text>
        <Image source={require("../../assets/click.png")} style={styles.icon} />
      </View>
    </View>
  );
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
});
