import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Link } from 'expo-router';

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
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export default function HomeScreen() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('is_featured', true)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(5),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (eventsRes.data) setFeaturedEvents(eventsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.headerTitle}>Discover Events</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Link key={category.id} href={`/events?category=${category.slug}`} asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <Link href="/events" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={16} color="#2563EB" strokeWidth={2} />
              </TouchableOpacity>
            </Link>
          </View>

          {featuredEvents.map((event) => (
            <Link key={event.id} href={`/event/${event.id}`} asChild>
              <TouchableOpacity style={styles.eventCard}>
                <Image
                  source={{
                    uri: event.image_url || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
                  }}
                  style={styles.eventImage}
                />
                <View style={styles.eventOverlay}>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                      <MapPin size={14} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.eventMetaText}>{event.location}</Text>
                    </View>
                    <View style={styles.eventMeta}>
                      <Calendar size={14} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.eventMetaText}>{formatDate(event.date)}</Text>
                      <Text style={styles.eventMetaSeparator}>•</Text>
                      <Clock size={14} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.eventMetaText}>{formatTime(event.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{formatPrice(event.price)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))}

          {featuredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No featured events available</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#0F172A',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0F172A',
  },
  featuredSection: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#2563EB',
  },
  eventCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  eventMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  eventMetaSeparator: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    marginHorizontal: 4,
  },
  priceTag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
});
