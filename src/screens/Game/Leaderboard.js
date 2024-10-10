import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { db } from '../../firebaseConfig'; // Import your Firestore db
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAtom } from "jotai";
import { store } from "../../store"; // Assuming your store is set up

const Leaderboard = () => {
  const [records, setRecords] = useState([]);
  const [data] = useAtom(store);
  const [difficulty, setDifficulty] = useState(0); // Default to Easy difficulty

  useEffect(() => {
    const fetchRecords = async () => {
      const q = query(collection(db, "game_results"), where("difficulty", "==", difficulty));
      const querySnapshot = await getDocs(q);
      const results = [];
      const playerRecords = {};

      querySnapshot.forEach((doc) => {
        const record = { id: doc.id, ...doc.data() };
        if (!playerRecords[record.playerName] || record.time < playerRecords[record.playerName].time) {
          playerRecords[record.playerName] = record; // Store the fastest time for each player
        }
      });

      Object.values(playerRecords).forEach(record => results.push(record));
      results.sort((a, b) => a.time - b.time);
      setRecords(results);
    };

    fetchRecords();
  }, [difficulty]);

  const changeDifficulty = (level) => {
    setDifficulty(level);
  };

const renderItem = ({ item, index }) => {
    let medalIcon;
    if (index === 0) {
        medalIcon = require('../../../assets/medal1.png'); // Gold
    } else if (index === 1) {
        medalIcon = require('../../../assets/medal2.png'); // Silver
    } else if (index === 2) {
        medalIcon = require('../../../assets/medal3.png'); // Bronze
    }

    // Add extra padding for ranks from 4th place onwards
    const isLowerRank = index >= 3; // Adjust starting from index 3 (4th place)

    return (
        <View style={styles.recordContainer}>
            <View style={[styles.rankContainer, isLowerRank && styles.lowerRankContainer]}>
                {medalIcon && <Image source={medalIcon} style={styles.medalIcon} />}
                <Text style={styles.rankText}>{index + 1}   </Text>
                <Text style={styles.recordText}>{item.playerName}</Text>
            </View>
            <Text style={styles.timeText}>Time: {item.time}s</Text>
        </View>
    );
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => changeDifficulty(0)} style={[styles.tab, difficulty === 0 && styles.activeTab]}>
          <Text style={styles.tabText}>Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDifficulty(1)} style={[styles.tab, difficulty === 1 && styles.activeTab]}>
          <Text style={styles.tabText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDifficulty(2)} style={[styles.tab, difficulty === 2 && styles.activeTab]}>
          <Text style={styles.tabText}>Hard</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0", 
    marginTop: 20,// Light background for better contrast
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50", // Darker title color for contrast
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#3498db", // Primary color for tabs
  },
  activeTab: {
    backgroundColor: "#2980b9", // Darker shade when active
  },
  tabText: {
    fontSize: 18,
    color: "#ffffff", // White text for tabs
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#bdc3c7", // Light gray border
    backgroundColor: "#ffffff", // White background for records
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000", // Shadow effect
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: "space-between", // Space out items evenly
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Allows rankContainer to take available space
  },
  medalIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  lowerRankContainer: {
    marginLeft: 50, // Adjust this value to control how much to shift
},
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 40, // Increased space between rank and name
  },
  recordText: {
    fontSize: 18,
    color: "#555",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    marginRight:10 // Align text to the right
  },
  medalIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rankText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e67e22", // Color for ranking numbers
  },
  recordText: {
    fontSize: 20,
    color: "#34495e", // Darker text for records
  },
});

export default Leaderboard;
