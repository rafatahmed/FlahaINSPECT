import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export const color = {
  canvas: '#101418', surface: '#1C232B', ink: '#F5F7FA', muted: '#D0D7DE',
  accent: '#69F0AE', border: '#75838E', warning: '#FFD740',
};

export function FieldBrand() {
  return <View style={styles.brand}>
    <Image source={require('./assets/logo-white.png')} style={styles.logo} accessible={false} />
    <Text style={styles.brandName}>FlahaINSPECT</Text>
  </View>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 18, borderBottomWidth: 1, borderColor: color.border },
  logo: { width: 54, height: 54 },
  brandName: { color: color.ink, fontSize: 22, fontWeight: '700', flexShrink: 1 },
});
