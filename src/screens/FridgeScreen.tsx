import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SQLiteIngredientRepository } from '../repositories/ingredient';
import { Ingredient } from '../types';

const repo = new SQLiteIngredientRepository();

export default function FridgeScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const load = useCallback(async () => {
    const data = await repo.getAll();
    setIngredients(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setQuantity('');
    setUnit('');
    setModalVisible(true);
  };

  const openEdit = (item: Ingredient) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity ?? '');
    setUnit(item.unit ?? '');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (editingId !== null) {
      await repo.update(editingId, quantity.trim(), unit.trim());
      setIngredients((prev) =>
        prev.map((i) =>
          i.id === editingId ? { ...i, quantity: quantity.trim(), unit: unit.trim() } : i,
        ),
      );
    } else {
      const trimmed = name.trim();
      if (!trimmed) return;
      await repo.add(trimmed, quantity.trim(), unit.trim());
      load();
    }
    setModalVisible(false);
  };

  const handleRemove = async (id: number) => {
    await repo.remove(id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Your pantry is empty.{'\n'}Add ingredients to get recipe suggestions!
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openEdit(item)} activeOpacity={0.7}>
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              {(item.quantity || item.unit) ? (
                <Text style={styles.detail}>
                  {[item.quantity, item.unit].filter(Boolean).join(' ')}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemove(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{editingId !== null ? 'Edit Quantity' : 'Add Ingredient'}</Text>

          {editingId === null && (
            <TextInput
              style={styles.input}
              placeholder="Name *"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          )}
          {editingId !== null && (
            <Text style={styles.editingName}>{name}</Text>
          )}
          <View style={styles.row2}>
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Quantity"
              placeholderTextColor="#999"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
            <View style={styles.spacer} />
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Unit (e.g. g, ml)"
              placeholderTextColor="#999"
              value={unit}
              onChangeText={setUnit}
            />
          </View>

          <TouchableOpacity
            style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim()}
          >
            <Text style={styles.addBtnText}>{editingId !== null ? 'Save' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const ORANGE = '#FF6B35';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 88 },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 60,
    fontSize: 15,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#2D2D2D' },
  detail: { fontSize: 13, color: '#888', marginTop: 2 },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16, color: '#ccc' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2D2D2D',
    marginBottom: 12,
    backgroundColor: '#FAFAF8',
  },
  row2: { flexDirection: 'row' },
  flex1: { flex: 1 },
  spacer: { width: 10 },
  addBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  editingName: { fontSize: 16, fontWeight: '600', color: '#2D2D2D', marginBottom: 12 },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
