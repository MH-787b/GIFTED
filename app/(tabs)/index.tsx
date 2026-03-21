import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, signOut } = useAuth();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Welcome, {user?.name ?? 'Guest'}
        </Text>
        <Text style={[styles.cardBody, { color: colors.textMuted }]}>
          Your personal gift tracker. Keep track of people, gifts, and ideas all in one place.
        </Text>
        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.8}
          onPress={signOut}
        >
          <Text style={[styles.signOutText, { color: colors.textMuted }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: Colors.coral }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>People</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: Colors.coral }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Gifts</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: Colors.coral }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ideas</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Upcoming</Text>
        <Text style={[styles.cardBody, { color: colors.textMuted }]}>
          No upcoming occasions yet. Add some people to get started!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  signOutButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  signOutText: {
    fontSize: 14,
  },
});
