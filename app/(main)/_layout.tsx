import { Tabs } from "expo-router";
import EVATabBar from "../../src/components/layout/EVATabBar";

export default function MainLayout() {
  return (
    <Tabs
      tabBar={(props) => <EVATabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="planning" options={{ title: "Planes" }} />
      <Tabs.Screen name="add" options={{ title: "Nuevo" }} />
      <Tabs.Screen name="goals" options={{ title: "Metas" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
