import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { CreditCard, Trash2, Plus, Wifi } from 'lucide-react-native';
import { MockDataService, MockNFCCard } from '../../../service/MockDataService';
import CustomModal from '../../component/modals/CustomModal';

type ScanState = 'idle' | 'scanning' | 'detected';

const generateUID = () => {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}`;
};

export const MockNFCManager: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [cards, setCards] = useState<MockNFCCard[]>([]);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [detectedUID, setDetectedUID] = useState('');
  const [cardName, setCardName] = useState('');
  const [saving, setSaving] = useState(false);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setCards(await MockDataService.getNFCCards());
  }, []);

  useEffect(() => { load(); }, [load]);

  const startScan = () => {
    setScanModalVisible(true);
    setScanState('scanning');
    setDetectedUID('');
    setCardName('');
    // Simulate NFC detection after 3 seconds
    scanTimer.current = setTimeout(() => {
      const uid = generateUID();
      setDetectedUID(uid);
      setScanState('detected');
    }, 3000);
  };

  const cancelScan = () => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setScanModalVisible(false);
    setScanState('idle');
    setDetectedUID('');
    setCardName('');
  };

  const handleRegister = async () => {
    if (!cardName.trim()) { Alert.alert('Required', 'Give this card a name.'); return; }
    setSaving(true);
    await MockDataService.addNFCCard(cardName.trim(), detectedUID);
    await load();
    setSaving(false);
    cancelScan();
  };

  const handleDelete = (card: MockNFCCard) => {
    Alert.alert('Remove Card', `Remove "${card.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await MockDataService.deleteNFCCard(card.id);
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
              <CreditCard size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-white font-black text-xl uppercase tracking-tighter">NFC Tokens</Text>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-0.5">{cards.length} registered</Text>
            </View>
          </View>
          <Text className="text-zinc-600 text-xs font-black uppercase tracking-widest">{expanded ? 'CLOSE' : 'MANAGE'}</Text>
        </View>

        {expanded && (
          <View className="mt-6 gap-3">
            {cards.map(card => (
              <View key={card.id} className="flex-row items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4">
                <View>
                  <Text className="text-white font-black uppercase tracking-tight">{card.name}</Text>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-0.5">UID: {card.uid}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(card)} className="p-2" activeOpacity={0.7}>
                  <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={startScan}
              className="flex-row items-center justify-center gap-2 bg-white rounded-2xl py-4 mt-2"
              activeOpacity={0.8}
            >
              <Plus size={18} color="#000000" strokeWidth={3} />
              <Text className="text-black font-black text-[11px] uppercase tracking-[2px]">Scan New Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Scan / Register Modal */}
      <CustomModal
        visible={scanModalVisible}
        onClose={cancelScan}
        title={scanState === 'detected' ? 'Card Detected' : 'Scanning...'}
        primaryAction={scanState === 'detected' ? {
          label: saving ? 'Registering...' : 'Register Card',
          onPress: handleRegister,
          disabled: saving || !cardName.trim(),
          loading: saving,
        } : undefined}
        secondaryAction={{ label: 'Cancel', onPress: cancelScan }}
      >
        {scanState === 'scanning' && (
          <View className="items-center py-8 gap-4">
            <View className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full items-center justify-center">
              <Wifi size={40} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <ActivityIndicator color="#FFFFFF" size="large" />
            <Text className="text-white font-black text-lg uppercase tracking-tighter">Waiting for NFC Card</Text>
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] text-center">
              Hold your NFC card near the device...
            </Text>
          </View>
        )}

        {scanState === 'detected' && (
          <View className="gap-4">
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4">
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mb-1">Card UID</Text>
              <Text className="text-white font-black uppercase tracking-tight">{detectedUID}</Text>
            </View>
            <View>
              <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[2px] mb-2">Card Name</Text>
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="e.g. Admin Card, Spare Card"
                placeholderTextColor="#52525B"
                autoFocus
                className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800"
              />
            </View>
          </View>
        )}
      </CustomModal>
    </>
  );
};
