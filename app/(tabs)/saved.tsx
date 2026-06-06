import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MapPin, Calendar, Clock } from 'lucide-react-native';
import { Link, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSavedEvents } from '@/lib/saved-events';

type Event = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  location: string;
  venue: string;
  date: string;
  end_date: string | null;
  price: number | null;
  is_featured: boolean;
  category_id: string;
  categories: {
    name: string;
    slug: string;
  } | null;
};

export default function SavedScreen() {
  const { savedIds } = useSavedEvents();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchSavedEvents = async () => {
        if (savedIds.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const { data } = await supabase
            .from('events')
            .select('*, categories(name, slug)')
            .in('id', savedIds);

          if (active && data) {
            // Preserve the order events were saved in (most recent last in storage).
            const rows = data as unknown as Event[];
            const byId = new Map(rows.map((event) => [event.id, event]));
            const ordered = savedIds
              .map((id) => byId.get(id))
              .filter((event): event is Event => Boolean(event));
            setEvents(ordered);
          }
        } catch (error) {
          console.error('Error fetching saved events:', error);
        } finally {
          if (active) setLoading(false);
        }
      };

      fetchSavedEvents();

      return () => {
        active = false;
      };
    }, [savedIds])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === 0) return 'Free';
    return `$${price.toFixed(0)}`;
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <Link href={`/event/${item.id}`} asChild>
      <TouchableOpacity style={styles.eventCard}>
        <Image
          source={{
            uri: item.image_url || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
          }}
          style={styles.eventImage}
        />
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
            </View>
          </View>

          <View style={styles.eventMeta}>
            <MapPin size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.eventMetaText} numberOfLines={1}>{item.venue}</Text>
          </View>

          <View style={styles.eventMeta}>
            <Calendar size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.eventMetaText}>{formatDate(item.date)}</Text>
            <Text style={styles.eventMetaSeparator}>•</Text>
            <Clock size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.eventMetaText}>{formatTime(item.date)}</Text>
          </View>

          {item.categories && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.categories.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Events</Text>
        <Text style={styles.headerSubtitle}>Your favorite events</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={events.length === 0 ? styles.emptyContent : styles.eventsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Heart size={48} color="#94A3B8" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No saved events yet</Text>
              <Text style={styles.emptySubtitle}>
                Save events you're interested in to find them here later
              </Text>
            </View>
          }
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    padding: 24,
    paddingTop: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
  },
  eventImage: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  priceTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#2563EB',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  eventMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  eventMetaSeparator: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },
  categoryTagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
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
