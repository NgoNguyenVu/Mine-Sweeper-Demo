import {
    View,
    Text,
    Dimensions,
    Pressable,
    StyleSheet,
    Image,
    Vibration
  } from "react-native"
  import options from "../../options.json"
  import colors from "../../colors"
  import { useAtom } from "jotai"
  import { store } from "../store"
  import AsyncStorage from "@react-native-async-storage/async-storage"
  
  const width = Dimensions.get("window").width
  
  export default function Table({
    table,
    setTable,
    isFirst,
    setIsFirst,
    isPlay,
    setIsPlay,
    setNumOfFlag,
    time
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
    ]
  
    const [data, setData] = useAtom(store)
  
    const difficulty = data.difficulty
  
    const isVibrationEnabled = data.vibration
  
    function isFinish() {
      for (let i = 0; i < table.length; ++i) {
        for (let j = 0; j < table.length; ++j) {
          if (
            !table[i][j].isPressed &&
            ((table[i][j].isFlagged && !table[i][j].isMine) ||
              (!table[i][j].isFlagged && table[i][j].isMine) ||
              (!table[i][j].isFlagged && !table[i][j].isMine))
          )
            return false
        }
      }
  
      return true
    }
  
    function saveRecord() {
      if ((difficulty === 0 && data.records.e === 0) || time < data.records.e) {
        setData({ ...data, records: { ...data.records, e: time } })
        AsyncStorage.setItem(
          "Records",
          JSON.stringify({ ...data.records, e: time })
        )
      }
      if ((difficulty === 1 && data.records.m === 0) || time < data.records.m) {
        setData({ ...data, records: { ...data.records, m: time } })
        AsyncStorage.setItem(
          "Records",
          JSON.stringify({ ...data.records, m: time })
        )
      }
      if ((difficulty === 2 && data.records.h === 0) || time < data.records.h) {
        setData({ ...data, records: { ...data.records, h: time } })
        AsyncStorage.setItem(
          "Records",
          JSON.stringify({ ...data.records, h: time })
        )
      }
    }
  
    function onPress(row, column) {
      if (isFirst) {
        createMines(row, column)
        setIsFirst(false)
      }
  
      if (table[row][column].isFlagged || table[row][column].isPressed || !isPlay)
        return
  
      let newTable = [...table]
      newTable[row][column].isPressed = true
      if (newTable[row][column].isMine) {
        setIsPlay(false)
      }
  
      if (newTable[row][column].numberOfAdjacentMines === 0) {
        let neighbourTileStack = []
  
        neighbourTileStack.push([row, column])
  
        while (neighbourTileStack.length > 0) {
          const [rowIndex, columnIndex] = neighbourTileStack.pop()
  
          modifierList.forEach(([rowModifier, columnModifier]) => {
            if (
              rowIndex + rowModifier >= 0 &&
              rowIndex + rowModifier < options[difficulty].tableLength &&
              columnIndex + columnModifier >= 0 &&
              columnIndex + columnModifier < options[difficulty].tableLength &&
              !newTable[rowIndex + rowModifier][columnIndex + columnModifier]
                .isPressed &&
              !newTable[rowIndex + rowModifier][columnIndex + columnModifier]
                .isFlagged
            ) {
              newTable[rowIndex + rowModifier][
                columnIndex + columnModifier
              ].isPressed = true
              if (
                newTable[rowIndex + rowModifier][columnIndex + columnModifier]
                  .isMine
              ) {
                setIsPlay(false)
              }
              if (
                newTable[rowIndex + rowModifier][columnIndex + columnModifier]
                  .numberOfAdjacentMines === 0
              )
                neighbourTileStack.push([
                  rowIndex + rowModifier,
                  columnIndex + columnModifier
                ])
            }
          })
        }
      }
  
      setTable(newTable)
  
      if (isFinish()) {
        setIsPlay(false)
        saveRecord()
      }
    }
  
    function onFlag(row, column) {
      if (table[row][column].isPressed) return
  
      let newTable = [...table]
      if (newTable[row][column].isFlagged) {
        setNumOfFlag((prev) => prev - 1)
      } else {
        setNumOfFlag((prev) => prev + 1)
      }
  
      newTable[row][column].isFlagged = !newTable[row][column].isFlagged
  
      setTable(newTable)
      isVibrationEnabled && Vibration.vibrate(100)
    }
  
    function openAllNeighbour(row, column) {
      modifierList.forEach(([rowModifier, columnModifier]) => {
        if (
          row + rowModifier >= 0 &&
          row + rowModifier < options[difficulty].tableLength &&
          column + columnModifier >= 0 &&
          column + columnModifier < options[difficulty].tableLength
        )
          onPress(row + rowModifier, column + columnModifier)
      })
    }
  
    function onLongPress(row, column) {
      if (!isPlay) return
      if (table[row][column].isPressed) openAllNeighbour(row, column)
      else onFlag(row, column)
  
      if (isFinish()) {
        setIsPlay(false)
        saveRecord()
      }
    }
  
    function createMines(firstTouchRow, firstTouchColumn) {
      let numberOfMine = 0
  
      while (numberOfMine < options[difficulty].numberOfMine) {
        let x = Math.floor(Math.random() * options[difficulty].tableLength)
        let y = Math.floor(Math.random() * options[difficulty].tableLength)
  
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
                table[i][j].numberOfAdjacentMines += 1
              }
            }
          }
          table[x][y].isMine = true
          ++numberOfMine
        }
      }
    }
  
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
              )
            })}
          </View>
        ))}
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    table: {
      width: "100%",
      aspectRatio: 1,
      justifyContent: "space-evenly"
    },
  
    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-evenly"
    },
  
    tile: (isPressed, isMine, difficulty) => ({
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: 1,
      borderWidth: 1,
      backgroundColor: isPressed
        ? isMine
          ? colors.darkRed
          : colors.tileOpened
        : colors.tileClosed,
      width: width / options[difficulty].tableLength
    }),
  
    icon: (difficulty) => ({
      width: width / options[difficulty].tableLength,
      height: width / options[difficulty].tableLength,
      resizeMode: "contain"
    })
  })
  