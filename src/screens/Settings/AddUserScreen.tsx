import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function AddUserScreen() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Add User</Text>

      <Text style={{ marginBottom: 6 }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter email"
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 20 }}
      />

      <Button title="Submit (stub)" onPress={() => {}} />
    </View>
  );
}


