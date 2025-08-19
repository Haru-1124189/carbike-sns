import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "ホーム" }} />
      <Tabs.Screen name="talk" options={{ title: "トーク" }} />
      <Tabs.Screen name="records" options={{ title: "整備記録" }} />
      <Tabs.Screen name="map" options={{ title: "マップ" }} />
    </Tabs>
  );
}