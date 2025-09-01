import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import './global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text className='text-yellow-800 text-3xl'>App</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default App

const styles = StyleSheet.create({})