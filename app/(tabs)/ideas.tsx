import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Idea {
  id: string;
  title: string;
  person: string;
  friends: string[];
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = 'gifted_ideas';

export default function IdeasScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState('');
  const [friends, setFriends] = useState<string[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setIdeas(JSON.parse(data));
    });
  }, []);

  const saveIdeas = useCallback(async (updated: Idea[]) => {
    setIdeas(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    if (editingId) {
      const updated = ideas.map((i) =>
        i.id === editingId
          ? { ...i, title: title.trim(), person: person.trim(), friends, notes: notes.trim() }
          : i
      );
      saveIdeas(updated);
    } else {
      const idea: Idea = {
        id: Date.now().toString(),
        title: title.trim(),
        person: person.trim(),
        friends,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      saveIdeas([idea, ...ideas]);
    }
    resetForm();
    setModalVisible(false);
  };

  const handleEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setTitle(idea.title);
    setPerson(idea.person);
    setFriends(idea.friends ?? []);
    setFriendInput('');
    setNotes(idea.notes);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    saveIdeas(ideas.filter((i) => i.id !== id));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setPerson('');
    setFriends([]);
    setFriendInput('');
    setNotes('');
  };

  const addFriend = () => {
    const name = friendInput.trim();
    if (name && !friends.includes(name)) {
      setFriends([...friends, name]);
    }
    setFriendInput('');
  };

  const removeFriend = (name: string) => {
    setFriends(friends.filter((f) => f !== name));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {ideas.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardBody, { color: colors.textMuted }]}>
              No gift ideas saved yet. Tap the button below to jot one down!
            </Text>
          </View>
        ) : (
          ideas.map((idea) => (
            <Pressable
              key={idea.id}
              style={[styles.card, { backgroundColor: colors.cardBackground }]}
              onPress={() => handleEdit(idea)}
            >
              <Text style={[styles.ideaTitle, { color: colors.text }]}>
                {idea.title}
              </Text>
              {(idea.person || (idea.friends && idea.friends.length > 0)) ? (
                <Text style={[styles.ideaPerson, { color: Colors.coral }]}>
                  For {[idea.person, ...(idea.friends ?? [])].filter(Boolean).join(', ')}
                </Text>
              ) : null}
              {idea.notes ? (
                <Text style={[styles.ideaNotes, { color: colors.textMuted }]} numberOfLines={2}>
                  {idea.notes}
                </Text>
              ) : null}
              <View style={styles.ideaFooter}>
                <View style={{ backgroundColor: 'transparent' }} />
                <Pressable onPress={() => handleDelete(idea.id)} hitSlop={8}>
                  <Text style={[styles.deleteText, { color: colors.textMuted }]}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Add Idea Button */}
      <Pressable
        style={[styles.fab, { backgroundColor: Colors.coral }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+ Add Idea</Text>
      </Pressable>

      {/* Add/Edit Idea Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { resetForm(); setModalVisible(false); }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { resetForm(); setModalVisible(false); }}>
              <Text style={[styles.modalCancel, { color: colors.textMuted }]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingId ? 'Edit Idea' : 'Add Idea'}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.formContent}>
            {/* Idea Title */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Gift idea
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Noise-cancelling headphones"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Person */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Who is it for? (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={person}
                onChangeText={setPerson}
                placeholder="e.g. Mom"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Friends */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Friends (optional)
              </Text>
              <View style={styles.friendInputRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.friendInput,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={friendInput}
                  onChangeText={setFriendInput}
                  placeholder="e.g. Sarah"
                  placeholderTextColor={colors.textMuted}
                  onSubmitEditing={addFriend}
                  returnKeyType="done"
                />
                <Pressable
                  style={[
                    styles.addFriendBtn,
                    { backgroundColor: friendInput.trim() ? Colors.coral : colors.border },
                  ]}
                  onPress={addFriend}
                  disabled={!friendInput.trim()}
                >
                  <Text style={[styles.addFriendBtnText, { color: friendInput.trim() ? '#fff' : colors.textMuted }]}>
                    Add
                  </Text>
                </Pressable>
              </View>
              {friends.length > 0 && (
                <View style={styles.friendChips}>
                  {friends.map((f) => (
                    <View key={f} style={[styles.friendChip, { backgroundColor: Colors.coral + '18' }]}>
                      <Text style={[styles.friendChipText, { color: Colors.coral }]}>{f}</Text>
                      <Pressable onPress={() => removeFriend(f)} hitSlop={6}>
                        <Text style={[styles.friendChipRemove, { color: Colors.coral }]}> ×</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Saw it on sale at..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <Pressable
              style={[
                styles.saveButton,
                { backgroundColor: title.trim() ? Colors.coral : colors.border },
              ]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={[styles.saveButtonText, { color: title.trim() ? '#fff' : colors.textMuted }]}>
                {editingId ? 'Update Idea' : 'Save Idea'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  ideaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ideaPerson: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ideaNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
  ideaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  deleteText: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContent: {
    padding: 20,
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  friendInputRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  friendInput: {
    flex: 1,
  },
  addFriendBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFriendBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  friendChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  friendChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  friendChipRemove: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
