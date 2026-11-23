
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@todo_app_tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
          setTasks(JSON.parse(saved));
        }
      } catch (error) {
        Alert.alert('Error', 'Could not load your tasks.');
      } finally {
        setLoaded(true);
      }
    };

    loadTasks();
  }, []);

  // Save tasks
  const updateTasks = async (newTasks) => {
    try {
      setSaving(true);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newTasks)
      );

      setTasks(newTasks);
      return true;
    } catch (error) {
      Alert.alert('Error', 'Could not save your tasks.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Add or update task
  const handleSubmit = async () => {
    const trimmed = text.trim();

    if (!trimmed || saving) return;

    let updatedTasks;

    if (editingId) {
      updatedTasks = tasks.map((task) =>
        task.id === editingId
          ? { ...task, title: trimmed }
          : task
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        title: trimmed,
        done: false,
      };

      updatedTasks = [newTask, ...tasks];
    }

    const success = await updateTasks(updatedTasks);

    if (success) {
      setText('');
      setEditingId(null);
    }
  };

  // Edit task
  const startEdit = (task) => {
    setEditingId(task.id);
    setText(task.title);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setText('');
  };

  // Mark task as completed
  const toggleDone = async (id) => {
    if (saving) return;

    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, done: !task.done }
        : task
    );

    await updateTasks(updatedTasks);
  };

  // Delete task
  const deleteTask = async (id) => {
    if (saving) return;

    const updatedTasks = tasks.filter(
      (task) => task.id !== id
    );

    const success = await updateTasks(updatedTasks);

    if (success && id === editingId) {
      cancelEdit();
    }
  };

  const completedTasks = tasks.filter((task) => task.done).length;
  const remainingTasks = tasks.length - completedTasks;

  const renderItem = ({ item }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => toggleDone(item.id)}
        disabled={saving}
      >
        <View style={[
          styles.checkbox,
          item.done && styles.checkboxDone
        ]}>
          {item.done && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>

      <Text
        style={[
          styles.taskTitle,
          item.done && styles.completedTitle
        ]}
      >
        {item.title}
      </Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => startEdit(item)}
        disabled={saving}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
        disabled={saving}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7F3" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>STAY ORGANIZED</Text>
              <Text style={styles.headerTitle}>My Tasks</Text>
              <Text style={styles.subtitle}>
                Make today productive.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>✓</Text>
            </View>
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>YOUR PROGRESS</Text>

            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryNumber}>
                  {completedTasks}/{tasks.length}
                </Text>
                <Text style={styles.summaryCaption}>
                  Tasks completed
                </Text>
              </View>

              <View style={styles.remainingBadge}>
                <Text style={styles.remainingNumber}>
                  {remainingTasks}
                </Text>
                <Text style={styles.remainingLabel}>
                  Remaining
                </Text>
              </View>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: tasks.length
                      ? `${(completedTasks / tasks.length) * 100}%`
                      : '0%',
                  },
                ]}
              />
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {editingId ? 'Edit Task' : 'Add a Task'}
            </Text>
          </View>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="What do you need to do?"
              placeholderTextColor="#A0AAA2"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={styles.addButtonText}>
                {saving
                  ? '...'
                  : editingId
                    ? 'Save'
                    : '+ Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {editingId && (
            <TouchableOpacity
              onPress={cancelEdit}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel editing</Text>
            </TouchableOpacity>
          )}

          {/* Task List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Tasks</Text>
            <Text style={styles.taskCount}>
              {tasks.length} total
            </Text>
          </View>

          {!loaded ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#347653" />
              <Text style={styles.loadingText}>
                Loading your tasks...
              </Text>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📝</Text>
                  <Text style={styles.emptyTitle}>
                    No tasks yet
                  </Text>
                  <Text style={styles.emptyText}>
                    Add your first task and start organizing your day.
                  </Text>
                </View>
              }
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F7F3',
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#668674',
    marginBottom: 7,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D3025',
  },

  subtitle: {
    fontSize: 14,
    color: '#849188',
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DCEBDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIconText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#347653',
  },

  summaryCard: {
    backgroundColor: '#24583D',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
  },

  summaryLabel: {
    color: '#C4D9C9',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
  },

  summaryNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summaryCaption: {
    fontSize: 13,
    color: '#D2E1D5',
    marginTop: 3,
  },

  remainingBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 10,
    alignItems: 'center',
  },

  remainingNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24583D',
  },

  remainingLabel: {
    fontSize: 11,
    color: '#718076',
    marginTop: 2,
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#52765F',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: 7,
    backgroundColor: '#D5E8B8',
    borderRadius: 10,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#24352A',
  },

  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE3',
    marginBottom: 22,
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#26372B',
  },

  addButton: {
    backgroundColor: '#347653',
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 10,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  cancelButton: {
    alignSelf: 'flex-end',
    marginTop: -15,
    marginRight: 22,
    marginBottom: 15,
    padding: 5,
  },

  cancelText: {
    color: '#B34B40',
    fontSize: 12,
    fontWeight: '600',
  },

  taskCount: {
    color: '#89968D',
    fontSize: 12,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECE6',
  },

  checkButton: {
    padding: 3,
    marginRight: 10,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.8,
    borderColor: '#77A185',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxDone: {
    backgroundColor: '#347653',
    borderColor: '#347653',
  },

  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: '#29392F',
    fontWeight: '500',
  },

  completedTitle: {
    color: '#A0AAA3',
    textDecorationLine: 'line-through',
  },

  editButton: {
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  editText: {
    color: '#347653',
    fontSize: 12,
    fontWeight: '700',
  },

  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FCECEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 3,
  },

  deleteText: {
    color: '#C34D43',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 23,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 35,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34473A',
  },

  emptyText: {
    fontSize: 13,
    color: '#8A968D',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  loadingContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },

  loadingText: {
    color: '#849188',
    marginTop: 10,
    fontSize: 13,
  },
});
