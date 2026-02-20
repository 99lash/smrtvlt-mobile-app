import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Key, Plus, Trash2 } from 'lucide-react-native';
import { MockDataService, MockPin } from '../../../service/MockDataService';
import CustomModal from '../../component/modals/CustomModal';

export const MockPinManager: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [pins, setPins] = useState<MockPin[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setPins(await MockDataService.getPins());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!label.trim()) { Alert.alert('Required', 'Enter a label for this PIN.'); return; }
    setSaving(true);
    await MockDataService.addPin(label.trim());
    await load();
    setSaving(false);
    setLabel('');
    setAddModalVisible(false);
  };

  const handleDelete = (pin: MockPin) => {
    Alert.alert('Delete PIN', `Remove "${pin.label}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await MockDataService.deletePin(pin.id);
        await load();
      }},
    ]);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.8}
        className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-800 mb-6"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center">
              <Key size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-white font-black text-xl uppercase tracking-tighter">Pin Codes</Text>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-0.5">{pins.length} registered</Text>
            </View>
          </View>
          <Text className="text-zinc-600 text-xs font-black uppercase tracking-widest">{expanded ? 'CLOSE' : 'MANAGE'}</Text>
        </View>

        {expanded && (
          <View className="mt-6 gap-3">
            {pins.map(pin => (
              <View key={pin.id} className="flex-row items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4">
                <View>
                  <Text className="text-white font-black uppercase tracking-tight">{pin.label}</Text>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-0.5">{pin.pin}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(pin)} className="p-2" activeOpacity={0.7}>
                  <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => { setLabel(''); setAddModalVisible(true); }}
              className="flex-row items-center justify-center gap-2 bg-white rounded-2xl py-4 mt-2"
              activeOpacity={0.8}
            >
              <Plus size={18} color="#000000" strokeWidth={3} />
              <Text className="text-black font-black text-[11px] uppercase tracking-[2px]">Add PIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      <CustomModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        title="New PIN"
        primaryAction={{ label: saving ? 'Saving...' : 'Save PIN', onPress: handleAdd, disabled: saving || !label.trim(), loading: saving }}
        secondaryAction={{ label: 'Cancel', onPress: () => setAddModalVisible(false) }}
      >
        <View>
          <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[2px] mb-2">Label</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Master PIN, Guest PIN"
            placeholderTextColor="#52525B"
            className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800"
          />
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[2px] mt-3">PIN code will be randomly generated and masked.</Text>
        </View>
      </CustomModal>
    </>
  );
};
