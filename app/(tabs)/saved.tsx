import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Events</Text>
        <Text style={styles.headerSubtitle}>Your favorite events</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Heart size={48} color="#94A3B8" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No saved events yet</Text>
          <Text style={styles.emptySubtitle}>
            Save events you're interested in to find them here later
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
});
