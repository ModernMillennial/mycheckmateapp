import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useCalendarStore } from '../state/calendarStore';
import { cn } from '../utils/cn';

interface AddEventScreenProps {
  navigation: any;
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'
];

const AddEventScreen: React.FC<AddEventScreenProps> = ({ navigation }) => {
  const { addEvent } = useCalendarStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [allDay, setAllDay] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End time cannot be before start time');
      return;
    }

    addEvent({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startDate,
      endDate,
      allDay,
      reminder,
      reminderMinutes: reminder ? 15 : undefined,
      color: selectedColor,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-lg font-semibold text-gray-900">New Event</Text>
          <Pressable onPress={handleSave} className="bg-blue-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-medium">Save</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Event Details</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add description"
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              textAlignVertical="top"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Location (Optional)</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add location"
              className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
            />
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Time & Date</Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-700 font-medium">All Day</Text>
            <Switch value={allDay} onValueChange={setAllDay} />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Start</Text>
            <Pressable
              onPress={() => setShowStartPicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-3"
            >
              <Text className="text-gray-900">
                {allDay ? format(startDate, 'MMM d, yyyy') : format(startDate, 'MMM d, yyyy h:mm a')}
              </Text>
            </Pressable>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">End</Text>
            <Pressable
              onPress={() => setShowEndPicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-3"
            >
              <Text className="text-gray-900">
                {allDay ? format(endDate, 'MMM d, yyyy') : format(endDate, 'MMM d, yyyy h:mm a')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Options</Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-700 font-medium">Reminder</Text>
            <Switch value={reminder} onValueChange={setReminder} />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-3">Color</Text>
            <View className="flex-row flex-wrap">
              {colors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full mr-3 mb-3 items-center justify-center",
                    selectedColor === color && "border-2 border-gray-400"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode={allDay ? 'date' : 'datetime'}
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              if (selectedDate >= endDate) {
                setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
              }
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode={allDay ? 'date' : 'datetime'}
          display="default"
          minimumDate={startDate}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default AddEventScreen;