
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);

  const isDark = theme === 'Dark';

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.title,
        { color: isDark ? '#FFFFFF' : '#111827' }
      ]}>
        This is Activity 6 Welcome!
      </Text>

      <Text style={[
        styles.text,
        { color: isDark ? '#D1D5DB' : '#4B5563' }
      ]}>
        Current Theme: {theme} Mode
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10
  },

  text: {
    fontSize: 20
  }
});
