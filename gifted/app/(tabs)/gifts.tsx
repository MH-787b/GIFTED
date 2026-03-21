import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface Gift {
  id: string;
  name: string;
  from: string;
  price: number;
  direction: 'given' | 'received';
  createdAt: string;
}

const STORAGE_KEY = 'gifted_gifts';
const PRICE_MIN = 0;
const PRICE_MAX = 1500;
const PRICE_STEP = 5;

export default function GiftsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [price, setPrice] = useState(25);
  const [direction, setDirection] = useState<'given' | 'received'>('received');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setGifts(JSON.parse(data));
    });
  }, []);

  const saveGifts = useCallback(async (updated: Gift[]) => {
    setGifts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      const updated = gifts.map((g) =>
        g.id === editingId
          ? { ...g, name: name.trim(), from: from.trim() || 'Unknown', price, direction }
          : g
      );
      saveGifts(updated);
    } else {
      const gift: Gift = {
        id: Date.now().toString(),
        name: name.trim(),
        from: from.trim() || 'Unknown',
        price,
        direction,
        createdAt: new Date().toISOString(),
      };
      saveGifts([gift, ...gifts]);
    }
    resetForm();
    setModalVisible(false);
  };

  const handleEdit = (gift: Gift) => {
    setEditingId(gift.id);
    setName(gift.name);
    setFrom(gift.from);
    setPrice(gift.price);
    setDirection(gift.direction);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    saveGifts(gifts.filter((g) => g.id !== id));
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setFrom('');
    setPrice(25);
    setDirection('received');
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {gifts.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardBody, { color: colors.textMuted }]}>
              No gifts tracked yet. Tap the button below to add one!
            </Text>
          </View>
        ) : (
          gifts.map((gift) => (
            <Pressable
              key={gift.id}
              style={[styles.card, { backgroundColor: colors.cardBackground }]}
              onPress={() => handleEdit(gift)}
            >
              <View style={styles.giftHeader}>
                <View style={styles.giftInfo}>
                  <Text style={[styles.giftName, { color: colors.text }]}>
                    {gift.name}
                  </Text>
                  <Text style={[styles.giftFrom, { color: colors.textMuted }]}>
                    {gift.direction === 'received' ? 'From' : 'To'}: {gift.from}
                  </Text>
                </View>
                <Text style={[styles.giftPrice, { color: Colors.coral }]}>
                  ${gift.price}
                </Text>
              </View>
              <View style={styles.giftFooter}>
                <View
                  style={[
                    styles.directionBadge,
                    {
                      backgroundColor:
                        gift.direction === 'received'
                          ? Colors.coral + '18'
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.directionText,
                      {
                        color:
                          gift.direction === 'received'
                            ? Colors.coral
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {gift.direction === 'received' ? 'Received' : 'Given'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(gift.id)}
                  hitSlop={8}
                >
                  <Text style={[styles.deleteText, { color: colors.textMuted }]}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Add Gift Button */}
      <Pressable
        style={[styles.fab, { backgroundColor: Colors.coral }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+ Add Gift</Text>
      </Pressable>

      {/* Add Gift Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { resetForm(); setModalVisible(false); }}>
              <Text style={[styles.modalCancel, { color: colors.textMuted }]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingId ? 'Edit Gift' : 'Add Gift'}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.formContent}>
            {/* Direction Toggle */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Type
              </Text>
              <View
                style={[
                  styles.toggleRow,
                  { backgroundColor: colors.border },
                ]}
              >
                <Pressable
                  style={[
                    styles.toggleOption,
                    direction === 'received' && {
                      backgroundColor: Colors.coral,
                    },
                  ]}
                  onPress={() => setDirection('received')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color:
                          direction === 'received' ? '#fff' : colors.textMuted,
                      },
                    ]}
                  >
                    Received
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleOption,
                    direction === 'given' && {
                      backgroundColor: Colors.coral,
                    },
                  ]}
                  onPress={() => setDirection('given')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color:
                          direction === 'given' ? '#fff' : colors.textMuted,
                      },
                    ]}
                  >
                    Given
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Gift Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                What was it?
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
                value={name}
                onChangeText={setName}
                placeholder="e.g. Wireless headphones"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* From/To */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                {direction === 'received' ? 'Who was it from?' : 'Who was it for?'}
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
                value={from}
                onChangeText={setFrom}
                placeholder="e.g. Mom"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Price Slider */}
            <View style={styles.fieldGroup}>
              <View style={styles.priceHeader}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Price
                </Text>
                <Text style={[styles.priceValue, { color: Colors.coral }]}>
                  ${price}
                </Text>
              </View>
              <PriceSlider
                value={price}
                onValueChange={setPrice}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                trackColor={colors.border}
                fillColor={Colors.coral}
                thumbColor={Colors.coral}
              />
              <View style={styles.sliderButtons}>
                <Pressable
                  style={[styles.sliderBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => setPrice(Math.max(PRICE_MIN, price - PRICE_STEP))}
                >
                  <Text style={[styles.sliderBtnText, { color: colors.text }]}>−</Text>
                </Pressable>
                <TextInput
                  style={[
                    styles.priceInput,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={price.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (!isNaN(num)) {
                      setPrice(Math.min(PRICE_MAX, Math.max(PRICE_MIN, num)));
                    } else if (text === '') {
                      setPrice(0);
                    }
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <Pressable
                  style={[styles.sliderBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => setPrice(Math.min(PRICE_MAX, price + PRICE_STEP))}
                >
                  <Text style={[styles.sliderBtnText, { color: colors.text }]}>+</Text>
                </Pressable>
              </View>
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
                  ${PRICE_MIN}
                </Text>
                <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
                  ${PRICE_MAX}
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              style={[
                styles.saveButton,
                { backgroundColor: name.trim() ? Colors.coral : colors.border },
              ]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.saveButtonText, { color: name.trim() ? '#fff' : colors.textMuted }]}>
                {editingId ? 'Update Gift' : 'Save Gift'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

function PriceSlider({
  value,
  onValueChange,
  min,
  max,
  step,
  trackColor,
  fillColor,
  thumbColor,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
}) {
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const startX = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWidth.value = w;
    thumbX.value = ((value - min) / (max - min)) * w;
  };

  // Sync thumbX when value changes externally (e.g. +/- buttons)
  useEffect(() => {
    if (trackWidth.value > 0) {
      thumbX.value = ((value - min) / (max - min)) * trackWidth.value;
    }
  }, [value, min, max]);

  const updatePrice = useCallback(
    (x: number) => {
      if (trackWidth.value <= 0) return;
      const ratio = Math.max(0, Math.min(1, x / trackWidth.value));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, stepped));
      onValueChange(clamped);
    },
    [min, max, step, onValueChange]
  );

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(trackWidth.value, startX.value + e.translationX));
      thumbX.value = newX;
      runOnJS(updatePrice)(newX);
    })
    .hitSlop({ top: 20, bottom: 20, left: 10, right: 10 });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - 11 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  return (
    <View style={styles.sliderContainer} onLayout={onLayout}>
      <View style={[styles.sliderTrack, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.sliderFill, { backgroundColor: fillColor }, fillStyle]}
        />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sliderThumb, { backgroundColor: thumbColor }, thumbStyle]}
        />
      </GestureDetector>
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
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  giftInfo: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  giftName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  giftFrom: {
    fontSize: 14,
  },
  giftPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  giftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
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
  modalSave: {
    fontSize: 16,
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
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  sliderContainer: {
    height: 36,
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    top: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  sliderBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderBtnText: {
    fontSize: 22,
    fontWeight: '500',
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: 100,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  sliderLabel: {
    fontSize: 12,
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
