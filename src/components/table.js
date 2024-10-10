import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Dimensions,
  Pressable,
  StyleSheet,
  Image,
  Vibration,
  Alert
} from "react-native";
import options from "../../options.json";
import colors from "../../colors";
import { useAtom } from "jotai";
import { store, clickCountAtom } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from '../firebaseConfig'; // Import db từ tệp firebaseConfig
import { getAuth } from "firebase/auth";
import { collection, addDoc, doc, getDoc,setDoc } from "firebase/firestore";

const width = Dimensions.get("window").width;

export default function Table({
  table,
  setTable,
  isFirst,
  setIsFirst,
  isPlay,
  setIsPlay,
  setNumOfFlag,
  time,
  setTime
}) {
  const modifierList = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1]
  ];

  const [data, setData] = useAtom(store);
  const [clickCount, setClickCount] = useAtom(clickCountAtom); 

  const [isPaused, setIsPaused] = useState(false);
  const difficulty = data.difficulty;
  const isVibrationEnabled = data.vibration; // Kiểm tra tùy chọn rung

  function isFinish() {
    let allFlagsCorrect = true;
    let allCellsOpened = true;

    for (let i = 0; i < table.length; ++i) {
        for (let j = 0; j < table.length; ++j) {
            // Kiểm tra ô cờ
            if (table[i][j].isFlagged && !table[i][j].isMine) {
                allFlagsCorrect = false;
            }
            // Kiểm tra ô đã được mở
            if (!table[i][j].isPressed) {
                allCellsOpened = false;
            }
        }
    }

    // Kiểm tra điều kiện thắng
    return allCellsOpened || (allFlagsCorrect && !table.some(cell => !cell.isMine));
  }



  function convertTableToFirestoreFormat(table) {
    const flatTable = {};
    table.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            flatTable[`${rowIndex}-${cellIndex}`] = cell; // Create a unique key
        });
    });
    return flatTable;
}

async function saveGameState() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const gameStateData = {
          table: convertTableToFirestoreFormat(table), // Convert to Firestore-friendly format
          numOfFlag: data.numOfFlag !== undefined ? data.numOfFlag : 0,
          time: time,
          difficulty: data.difficulty,
          clickCount: clickCount, // Save the current click count
          date: new Date(),
      };

      try {
          await setDoc(doc(db, "saved_games", user.uid), gameStateData);
          console.log("Game state saved successfully:", gameStateData);
      } catch (error) {
          console.error("Error saving game state:", error);
      }
  } else {
      Alert.alert("Notification", "You need to be logged in to save the game state.");
  }
}






function convertFirestoreFormatToTable(flatTable, size) {
  const table = Array.from({ length: size }, () => Array(size).fill(null));

  Object.keys(flatTable).forEach((key) => {
      const [rowIndex, cellIndex] = key.split('-').map(Number);
      table[rowIndex][cellIndex] = flatTable[key];
  });

  return table;
}

async function loadGameState() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
      const docRef = doc(db, "saved_games", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
          const savedGame = docSnap.data();
          console.log("Loaded saved game state:", savedGame);

          // Check if there's a current game in progress
          if (isPlay) {
              const discard = await new Promise((resolve) => {
                  Alert.alert(
                      "Load Saved Game",
                      "You have a game in progress. Do you want to load it?",
                      [
                          { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
                          { text: "Load", onPress: () => {
                              resetGameState(); // Ensure state is reset
                              resolve(true);
                          }},
                      ]
                  );
              });

              if (!discard) {
                  return; // User chose not to discard the current game
              }
          }

          // Load the saved game state
          try {
              const flatTable = savedGame.table;
              const loadedTable = convertFirestoreFormatToTable(flatTable, options[data.difficulty].tableLength);
              setTable(loadedTable); // Set the loaded table
              setNumOfFlag(savedGame.numOfFlag || 0); // Set the number of flags
              setTime(savedGame.time || 0); // Set the loaded time
              setClickCount(savedGame.clickCount || 0); // Set the loaded click count
              setIsFirst(false); // If needed
              setIsPlay(true); // Set game status to true, allow playing
              console.log("Game state loaded successfully.");
          } catch (error) {
              console.error("Error loading game state:", error);
              Alert.alert("Error", "Failed to load the game state. Please try again.");
          }
      } else {
          Alert.alert("Error", "No saved game found.");
          console.error("No saved game document!");
      }
  } else {
      Alert.alert("Notification", "You need to be logged in to load a game.");
  }
}




function resetGameState() {
  setTable(Array.from({ length: options[data.difficulty].tableLength }, () =>
      Array.from({ length: options[data.difficulty].tableLength }, () => ({
          isPressed: false,
          isFlagged: false,
          isMine: false,
          numberOfAdjacentMines: 0
      }))
  )); // Set to the initial state
  setNumOfFlag(0);
  setTime(0);
  setClickCount(0); // Reset click count
  setIsPlay(true); // Reset the game to be playable
  setIsFirst(true); // Reset to allow for a new game
}


 const handlePauseResume = () => {
    setIsPaused((prev) => !prev); // Toggle pause state
    setIsPlay((prev) => !prev); // Toggle game play state
  };

  const handlePress = (row, column) => {
    if (!isPlay) return; // Ngăn chặn tương tác khi trò chơi đã dừng

    // Logic xử lý khi nhấn ô
    // Ví dụ: cập nhật bảng, kiểm tra nếu ô là mìn hay không...
    console.log(`Cell pressed at ${row}, ${column}`);
  };


  async function saveRecord() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const gameName = userData.gameName || "Người chơi";

            const recordData = {
                date: new Date(),
                difficulty: data.difficulty,
                numberCount: clickCount + 1, // Sử dụng clickCount đã cập nhật
                playerName: gameName,
                time: time
            };

            try {
                await addDoc(collection(db, "game_results"), recordData);
                console.log("Record saved successfully:", recordData);
            } catch (error) {
                console.error("Error saving record:", error);
            }
        } else {
            console.error("No such user document!");
            Alert.alert("Thông báo", "Không tìm thấy tài liệu người dùng.");
        }
    } else {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để lưu kết quả.");
    }
}

  

function onPress(row, column) {
  if (isFirst) {
      createMines(row, column);
      setIsFirst(false);
      setClickCount(0);
  }

  if (table[row][column].isFlagged || table[row][column].isPressed || !isPlay) return;

  let newTable = [...table];
  newTable[row][column].isPressed = true;

  // Cập nhật số lần nhấp
  const currentClickCount = clickCount + 1; // Tăng click count lên 1
  setClickCount(currentClickCount); // Cập nhật trạng thái mới

  // Kiểm tra ô có phải là mìn không
  if (newTable[row][column].isMine) {
      if (isVibrationEnabled) {
          Vibration.vibrate(500); // Rung khi dẫm vào mìn
      }
      if (difficulty === 0) {
          console.log("Chơi tiếp tục trong chế độ easy.");
      } else {
          setIsPlay(false);
          Alert.alert("Bạn đã dẫm trúng mìn!", "Game over.");
          return;
      }
  }

  // Nếu ô không phải là mìn và có số mìn lân cận là 0
  if (newTable[row][column].numberOfAdjacentMines === 0) {
      let neighbourTileStack = [];
      neighbourTileStack.push([row, column]);

      while (neighbourTileStack.length > 0) {
          const [rowIndex, columnIndex] = neighbourTileStack.pop();

          modifierList.forEach(([rowModifier, columnModifier]) => {
              if (
                  rowIndex + rowModifier >= 0 &&
                  rowIndex + rowModifier < options[difficulty].tableLength &&
                  columnIndex + columnModifier >= 0 &&
                  columnIndex + columnModifier < options[difficulty].tableLength &&
                  !newTable[rowIndex + rowModifier][columnIndex + columnModifier].isPressed &&
                  !newTable[rowIndex + rowModifier][columnIndex + columnModifier].isFlagged
              ) {
                  newTable[rowIndex + rowModifier][columnIndex + columnModifier].isPressed = true;
                  if (newTable[rowIndex + rowModifier][columnIndex + columnModifier].isMine) {
                      setIsPlay(false);
                  }
                  if (newTable[rowIndex + rowModifier][columnIndex + columnModifier].numberOfAdjacentMines === 0) {
                      neighbourTileStack.push([rowIndex + rowModifier, columnIndex + columnModifier]);
                  }
              }
          });
      }
  }

  setTable(newTable);

  // Kiểm tra xem trò chơi đã hoàn thành hay chưa
  if (isFinish()) {
      setIsPlay(false);
      saveRecord();
      Alert.alert("Chúc mừng!", "Bạn đã thắng!");
  }
}


  function onFlag(row, column) {
    if (table[row][column].isPressed) return;

    let newTable = [...table];
    if (newTable[row][column].isFlagged) {
      setNumOfFlag((prev) => prev - 1);
    } else {
      setNumOfFlag((prev) => prev + 1);
    }

    newTable[row][column].isFlagged = !newTable[row][column].isFlagged;

    setTable(newTable);
    isVibrationEnabled && Vibration.vibrate(100);
  }

  function openAllNeighbour(row, column) {
    modifierList.forEach(([rowModifier, columnModifier]) => {
      if (
        row + rowModifier >= 0 &&
        row + rowModifier < options[difficulty].tableLength &&
        column + columnModifier >= 0 &&
        column + columnModifier < options[difficulty].tableLength
      )
        onPress(row + rowModifier, column + columnModifier);
    });
  }

  function onLongPress(row, column) {
    if (!isPlay) return;
    if (table[row][column].isPressed) openAllNeighbour(row, column);
    else onFlag(row, column);

    if (isFinish()) {
      setIsPlay(false);
      saveRecord();
    }
  }

  function createMines(firstTouchRow, firstTouchColumn) {
    let numberOfMine = 0;

    while (numberOfMine < options[difficulty].numberOfMine) {
      let x = Math.floor(Math.random() * options[difficulty].tableLength);
      let y = Math.floor(Math.random() * options[difficulty].tableLength);

      if (
        !table[x][y].isMine &&
        (x < firstTouchRow - 1 ||
          x > firstTouchRow + 1 ||
          y < firstTouchColumn - 1 ||
          y > firstTouchColumn + 1)
      ) {
        for (let i = x - 1; i < x + 2; ++i) {
          for (let j = y - 1; j < y + 2; ++j) {
            if (
              i >= 0 &&
              i < options[difficulty].tableLength &&
              j >= 0 &&
              j < options[difficulty].tableLength
            ) {
              table[i][j].numberOfAdjacentMines += 1;
            }
          }
        }
        table[x][y].isMine = true;
        ++numberOfMine;
      }
    }
  }

  useEffect(() => {
    loadGameState(); // Load game state when the component mounts
}, []);

// You might want to save the game state when the component unmounts or when certain actions happen
useEffect(() => {
    return () => {
        saveGameState(); // Save game state when the component unmounts or game is paused
    };
}, [isPlay, table, time]);

  return (
    <View style={styles.table}>
      {table.map((row, rowIndex) => (
        <View style={styles.row} key={rowIndex}>
          {row.map((cell, cellIndex) => {
            return (
              <Pressable
                style={styles.tile(cell.isPressed, cell.isMine, difficulty)}
                key={`${rowIndex}${cellIndex}`}
                onPress={() => onPress(rowIndex, cellIndex)}
                onLongPress={() => onLongPress(rowIndex, cellIndex)}
              >
                {cell.isFlagged ? (
                  <Image
                    source={require("../../assets/redFlag.png")}
                    style={styles.icon(difficulty)}
                  />
                ) : cell.isPressed ? (
                  cell.isMine ? (
                    <Image
                      source={require("../../assets/mine.png")}
                      style={styles.icon(difficulty)}
                    />
                  ) : (
                    <Text>{cell.numberOfAdjacentMines}</Text>
                  )
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "space-evenly",
    padding: 10, // Add padding for spacing around the table
  },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 5, // Add vertical margin for spacing between rows
  },

  tile: (isPressed, isMine, difficulty) => ({
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    borderWidth: isPressed ? 0 : 2, // Show border only when not pressed
    borderColor: colors.borderColor, // Add border color
    backgroundColor: isPressed
      ? isMine
        ? colors.darkRed
        : colors.tileOpened
      : colors.tileClosed,
    width: width / options[difficulty].tableLength - 10, // Adjust size with padding
    borderRadius: 10, // Add rounded corners
    shadowColor: "#000", // Add shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, // Add elevation for Android
    margin: 2, // Add margin between tiles
  }),

  icon: (difficulty) => ({
    width: width / options[difficulty].tableLength - 20, // Adjust icon size with padding
    height: width / options[difficulty].tableLength - 20,
    resizeMode: "contain",
  }),
});
