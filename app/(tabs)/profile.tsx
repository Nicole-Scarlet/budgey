import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Theme tokens ─────────────────────────────────────
type Theme = {
  screenBg: string;
  headerBg: string;
  cardBg: string;
  avatarBg: string;
  editBtnBg: string;
  sectionLabel: string;
  rowLabel: string;
  rowIcon: string;
  chevron: string;
  divider: string;
  logoutBg: string;
  logoutText: string;
  versionText: string;
  trackColorFalse: string;
  thumbColor: string;
};

const darkTheme: Theme = {
  screenBg: '#0F172A',
  headerBg: '#334155',
  cardBg: '#475569',
  avatarBg: '#1E293B',
  editBtnBg: '#475569',
  sectionLabel: '#FFFFFF',
  rowLabel: '#FFFFFF',
  rowIcon: '#FFFFFF',
  chevron: '#CBD5E1',
  divider: 'rgba(255,255,255,0.1)',
  logoutBg: '#94A3B8',
  logoutText: '#EF4444',
  versionText: '#94A3B8',
  trackColorFalse: '#64748B',
  thumbColor: '#F1F5F9',
};

const lightTheme: Theme = {
  screenBg: '#F8FAFC',
  headerBg: '#E2E8F0',
  cardBg: '#FFFFFF',
  avatarBg: '#CBD5E1',
  editBtnBg: '#94A3B8',
  sectionLabel: '#0F172A',
  rowLabel: '#1E293B',
  rowIcon: '#334155',
  chevron: '#64748B',
  divider: 'rgba(0,0,0,0.08)',
  logoutBg: '#94A3B8',
  logoutText: '#EF4444',
  versionText: '#64748B',
  trackColorFalse: '#CBD5E1',
  thumbColor: '#334155',
};

// ─── Menu row ─────────────────────────────────────────
function MenuRow({
  icon,
  label,
  onPress,
  t,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  t: Theme;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
    >
      <View style={{ width: 36, alignItems: 'center' }}>
        <Ionicons name={icon} size={22} color={t.rowIcon} />
      </View>
      <Text
        style={{ flex: 1, marginLeft: 12, fontSize: 16, color: t.rowLabel, fontWeight: '500' }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward-outline" size={18} color={t.chevron} />
    </TouchableOpacity>
  );
}

// ─── Section header ───────────────────────────────────
function SectionHeader({ label, t }: { label: string; t: Theme }) {
  return (
    <Text
      style={{
        fontSize: 18,
        fontWeight: '700',
        color: t.sectionLabel,
        marginTop: 24,
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
  );
}

// ─── Divider ──────────────────────────────────────────
function Divider({ t }: { t: Theme }) {
  return <View style={{ height: 1, backgroundColor: t.divider }} />;
}

// ─── Main Screen ──────────────────────────────────────
export default function ProfileScreen() {
  const [albinoMode, setAlbinoMode] = useState(false);
  const t = albinoMode ? lightTheme : darkTheme;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.screenBg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* ── Header / Avatar area ── */}
          <View
            style={{
              backgroundColor: t.headerBg,
              alignItems: 'center',
              paddingTop: 32,
              paddingBottom: 32,
            }}
          >
            {/* Avatar */}
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: t.avatarBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person" size={52} color={t.chevron} />
              </View>
              {/* Edit button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: t.editBtnBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: t.headerBg,
                }}
              >
                <Ionicons name="pencil" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text
              style={{
                marginTop: 12,
                fontSize: 20,
                fontWeight: '700',
                color: t.sectionLabel,
                letterSpacing: 0.2,
              }}
            >
              Nigel Zomil
            </Text>
          </View>

          {/* ── Options card ── */}
          <View
            style={{
              marginHorizontal: 24,
              marginTop: 24,
              backgroundColor: t.cardBg,
              borderRadius: 25,
              paddingHorizontal: 24,
              paddingBottom: 24,
            }}
          >
            {/* Account */}
            <SectionHeader label="Account" t={t} />
            <MenuRow icon="person-outline" label="Profile" t={t} />
            <Divider t={t} />
            <MenuRow icon="shield-checkmark-outline" label="Security" t={t} />
            <Divider t={t} />
            <MenuRow icon="lock-closed-outline" label="Privacy" t={t} />

            {/* Support */}
            <SectionHeader label="Support" t={t} />
            <MenuRow icon="help-circle-outline" label="Help & Support" t={t} />
            <Divider t={t} />
            <MenuRow icon="document-text-outline" label="Terms & Conditions" t={t} />

            {/* Appearance */}
            <SectionHeader label="Appearance" t={t} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}
            >
              <View style={{ width: 36, alignItems: 'center' }}>
                <Ionicons name="sunny-outline" size={22} color={t.rowIcon} />
              </View>
              <Text
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  color: t.rowLabel,
                  fontWeight: '500',
                }}
              >
                Albino Mode
              </Text>
              <Switch
                value={albinoMode}
                onValueChange={setAlbinoMode}
                trackColor={{ false: t.trackColorFalse, true: '#6366F1' }}
                thumbColor={t.thumbColor}
                ios_backgroundColor={t.trackColorFalse}
              />
            </View>
          </View>

          {/* ── Logout button ── */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={{
              alignSelf: 'center',
              marginTop: 32,
              backgroundColor: t.logoutBg,
              borderRadius: 999,
              paddingVertical: 14,
              paddingHorizontal: 56,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: t.logoutText }}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* ── Version ── */}
          <Text
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: 12,
              color: t.versionText,
            }}
          >
            Version 1.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
