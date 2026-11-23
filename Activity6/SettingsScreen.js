
import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme, isSaving } =
    useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme Settings</Text>

      <Text style={styles.text}>
        Current Theme: {theme}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => toggleTheme('Light')}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>Light Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => toggleTheme('Dark')}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>Dark Mode</Text>
      </TouchableOpacity>

      {isSaving && (
        <Text style={styles.loading}>Saving...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 21
  },

  text: {
    fontSize: 17,
    marginBottom: 20
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
    marginBottom: 12
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  loading: {
    marginTop: 10,
    fontSize: 16,
    color: '#2563EB'
  }
});
