import Banner from "@/components/Banner";
import Card from "@/components/Card";
import { privateGroups, publicChats, qaThreads } from "@/data/dummy";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as React from "react";
import { FlatList, StyleSheet, View } from "react-native";

const TopTab = createMaterialTopTabNavigator();

function PublicTab() {
  return (
    <View style={styles.screen}>
      <Banner />
      <FlatList
        data={publicChats}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Card title={item.text} />}
      />
    </View>
  );
}
function PrivateTab() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={privateGroups}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Card title={item.name} subtitle="承認制グループ" />}
      />
    </View>
  );
}
function QATab() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={qaThreads}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Card title={item.title} subtitle="質問スレッド" />}
      />
    </View>
  );
}

export default function Talk() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen name="公開グル" component={PublicTab} />
      <TopTab.Screen name="認証グル" component={PrivateTab} />
      <TopTab.Screen name="質問" component={QATab} />
    </TopTab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#fff" },
});