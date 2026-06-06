import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, Clock, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Link, useLocalSearchParams } from 'expo-router';

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
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export default function EventsScreen() {
  const params = useLocalSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    }
  }, [params.category]);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select('*, categories(name, slug)')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (selectedCategory) {
        const category = categories.find((c) => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data } = await query;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>Discover local events near you</Text>
      </View>

      <View style={styles.filtersSection}>
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.slug)}
            style={[styles.filterChip, selectedCategory === category.slug && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedCategory === category.slug && styles.filterChipTextActive]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
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
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No events found</Text>
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
  filtersSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
});
