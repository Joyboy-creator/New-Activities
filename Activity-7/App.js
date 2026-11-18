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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@todo_app_tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null); // null = adding, id = editing
  const [loaded, setLoaded] = useState(false);

  // READ: load saved tasks once, when the app first mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setTasks(JSON.parse(saved)); // string -> array
        }
      } catch (error) {
        console.log('Load error:', error);
        Alert.alert('Error', 'Could not load your tasks.\n' + error.message);
      } finally {
        setLoaded(true);
      }
    };
    loadTasks();
  }, []);

  // Write the full list to storage as a JSON string
  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks)); // array -> string
    } catch (error) {
      console.log('Save error:', error);
      Alert.alert('Error', 'Could not save your tasks.\n' + error.message);
    }
  };

  // Update state and storage together
  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // CREATE or UPDATE (depending on editingId)
  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingId) {
      // UPDATE
      updateTasks(
        tasks.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t))
      );
      setEditingId(null);
    } else {
      // CREATE
      const newTask = { id: Date.now().toString(), title: trimmed, done: false };
      updateTasks([newTask, ...tasks]);
    }
    setText('');
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setText(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setText('');
  };

  const toggleDone = (id) => {
    updateTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // DELETE
  const deleteTask = (id) => {
    if (id === editingId) cancelEdit();
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowText} onPress={() => toggleDone(item.id)}>
        <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
          {item.done && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.title, item.done && styles.titleDone]}>{item.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionBtn}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.actionBtn}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.header}>My tasks</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={editingId ? 'Edit task' : 'Add a task'}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
              <Text style={styles.primaryBtnText}>{editingId ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {loaded && (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.empty}>No tasks yet. Add your first one above.</Text>
              }
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F6F7F4' },
  header: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1F2A24',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DAD2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: '#2F6B4F',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  cancelBtn: { paddingHorizontal: 10, paddingVertical: 12 },
  cancelBtnText: { color: '#5E6B63', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E4E8E1',
  },
  rowText: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2F6B4F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxDone: { backgroundColor: '#2F6B4F' },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  title: { flex: 1, fontSize: 16, color: '#1F2A24' },
  titleDone: { textDecorationLine: 'line-through', color: '#8A958E' },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  editText: { color: '#2F6B4F', fontWeight: '600' },
  deleteText: { color: '#B3402F', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#8A958E', marginTop: 40, fontSize: 15 },
});