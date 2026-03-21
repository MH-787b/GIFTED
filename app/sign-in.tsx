import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function handleSignIn() {
    if (!name.trim() || !email.trim()) return;
    await signIn(name, email);
  }

  const inputBg = colorScheme === 'dark' ? '#3d3530' : '#f5f0eb';
  const placeholderColor = colors.textMuted;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.emoji]}>🎁</Text>
          <Text style={[styles.title, { color: colors.text }]}>Gifted</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Track gifts with the people you care about
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Get Started
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: colors.text }]}
            placeholder="Your name"
            placeholderTextColor={placeholderColor}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: colors.text }]}
            placeholder="Email address"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              styles.signInButton,
              (!name.trim() || !email.trim()) && styles.signInButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleSignIn}
            disabled={!name.trim() || !email.trim()}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: '#D85A30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
