import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { useCalendarStore } from '../state/calendarStore';
import { CalendarEvent } from '../types/calendar';
import { cn } from '../utils/cn';

interface CalendarScreenProps {
  navigation: any;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    events,
    selectedDate,
    setSelectedDate,
    getEventsForDate,
    deleteEvent,
  } = useCalendarStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedEvents = getEventsForDate(selectedDate);

  const renderCalendarDay = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    const isSelected = isSameDay(day, selectedDate);
    const isCurrentDay = isToday(day);

    return (
      <Pressable
        key={day.toISOString()}
        onPress={() => selectDate(day)}
        className={cn(
          "flex-1 aspect-square items-center justify-center m-0.5 rounded-lg",
          isSelected && "bg-blue-500",
          isCurrentDay && !isSelected && "bg-blue-100",
          !isSelected && !isCurrentDay && "bg-gray-50"
        )}
      >
        <Text className={cn(
          "text-base font-medium",
          isSelected && "text-white",
          isCurrentDay && !isSelected && "text-blue-600",
          !isSelected && !isCurrentDay && "text-gray-900"
        )}>
          {format(day, 'd')}
        </Text>
        {dayEvents.length > 0 && (
          <View className="flex-row mt-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <View
                key={event.id}
                className="w-1.5 h-1.5 rounded-full mx-0.5"
                style={{ backgroundColor: event.color }}
              />
            ))}
            {dayEvents.length > 3 && (
              <Text className="text-xs text-gray-500 ml-1">+</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const renderEvent = (event: CalendarEvent) => {
    const handleDelete = () => {
      Alert.alert(
        "Delete Event",
        `Are you sure you want to delete "${event.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteEvent(event.id) }
        ]
      );
    };

    return (
      <View key={event.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: event.color }}
              />
              <Text className="font-semibold text-gray-900 flex-1">{event.title}</Text>
            </View>
            
            {event.description && (
              <Text className="text-gray-600 mb-2">{event.description}</Text>
            )}
            
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500 ml-2">
                {event.allDay 
                  ? "All day"
                  : `${format(event.startDate, 'h:mm a')} - ${format(event.endDate, 'h:mm a')}`
                }
              </Text>
            </View>

            {event.location && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text className="text-gray-500 ml-2">{event.location}</Text>
              </View>
            )}
          </View>
          
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Calendar</Text>
          <Pressable
            onPress={() => navigation.navigate('AddEvent')}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1">Add Event</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Month Navigation */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => navigateMonth('prev')} className="p-2">
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <Pressable onPress={() => navigateMonth('next')} className="p-2">
              <Ionicons name="chevron-forward" size={24} color="#374151" />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <View key={day} className="flex-1 items-center py-2">
                <Text className="text-sm font-medium text-gray-500">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {days.map(renderCalendarDay)}
          </View>
        </View>

        {/* Selected Date Events */}
        <View className="mx-4 mt-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          
          {selectedEvents.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center shadow-sm">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">No events scheduled</Text>
            </View>
          ) : (
            selectedEvents.map(renderEvent)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarScreen;