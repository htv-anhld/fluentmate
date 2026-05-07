import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, [IoniconName, IoniconName]> = {
  today: ['home', 'home-outline'],
  learn: ['library', 'library-outline'],
  talk: ['mic', 'mic-outline'],
  progress: ['stats-chart', 'stats-chart-outline'],
  profile: ['person-circle', 'person-circle-outline'],
};

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: {
            ...typography.caption,
            fontSize: 11,
            marginTop: -2,
          },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.line,
            paddingTop: 6,
          },
          tabBarItemStyle: { paddingTop: 2 },
          title: t(`tabs.${route.name}`, route.name),
          tabBarIcon: ({ focused, color }) => {
            const [activeName, inactiveName] = icons;
            return (
              <Ionicons
                name={focused ? activeName : inactiveName}
                size={24}
                color={color}
              />
            );
          },
        };
      }}
    >
      <Tabs.Screen name="today" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="talk" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
