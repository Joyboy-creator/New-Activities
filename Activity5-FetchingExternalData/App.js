
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

export default function App() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch(
          'https://pokeapi.co/api/v2/pokemon?limit=10'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Pokemon');
        }

        const data = await response.json();

        const details = await Promise.all(
          data.results.map(async (item) => {
            const result = await fetch(item.url);
            return await result.json();
          })
        );

        setPokemon(details);

      } catch (err) {
        setError(err.message);

      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text>Loading Pokemon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List of the Pokemon </Text>

      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.sprites.front_default
              }}
              style={styles.image}
            />

            <View>
              <Text style={styles.name}>
                {item.name.toUpperCase()}
              </Text>

              <Text>
                Number: {item.id}
              </Text>

              <Text>
                Type: {item.types.map(t => t.type.name).join(', ')}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
    paddingTop: 50
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10
  },

  image: {
    width: 90,
    height: 80,
    marginRight: 15
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});
